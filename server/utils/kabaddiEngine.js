import { RULES } from '../config/rules.js';

// Pure scoring engine. No database, no sockets: easy to test.
// State shape:
//   alive[team][0..6]  true = on the mat
//   queue[team]        players who are out, first out is first revived
//   empty[team]        empty raids in a row
//   raiding            0 or 1, whose raid it is now
//   score[team]

const fullTeam = () => Array(RULES.players).fill(true);
const clone = (x) => JSON.parse(JSON.stringify(x));

export function createState(firstRaid = 0) {
  return {
    alive: [fullTeam(), fullTeam()],
    queue: [[], []],
    empty: [0, 0],
    raiding: firstRaid === 1 ? 1 : 0,
    score: [0, 0],
  };
}

export const aliveCount = (state, team) => state.alive[team].filter(Boolean).length;
export const isDoOrDie = (state) => state.empty[state.raiding] >= RULES.doOrDieAfter;

// event: { type: 'RAID', touches, bonus } | { type: 'TACKLE' } | { type: 'EMPTY' }
// returns { error } or { state, effects, out, back, raider }
export function applyEvent(prev, event) {
  const s = clone(prev);
  const R = s.raiding;
  const D = 1 - R;
  const effects = [];
  const out = [[], []];
  const back = [[], []];

  const count = (t) => s.alive[t].filter(Boolean).length;
  const kill = (t, n) => {
    let done = 0;
    for (let i = 0; i < RULES.players && done < n; i++) {
      if (s.alive[t][i]) {
        s.alive[t][i] = false;
        s.queue[t].push(i);
        out[t].push(i);
        done++;
      }
    }
  };
  const revive = (t, n) => {
    while (n > 0 && s.queue[t].length) {
      const i = s.queue[t].shift();
      s.alive[t][i] = true;
      back[t].push(i);
      n--;
    }
  };
  const checkAllOut = (attacker, victim) => {
    if (count(victim) === 0) {
      s.score[attacker] += RULES.allOutPoints;
      s.alive[victim] = fullTeam();
      s.queue[victim] = [];
      back[victim] = [...Array(RULES.players).keys()];
      effects.push({ type: 'ALL_OUT', team: victim, by: attacker, points: RULES.allOutPoints });
    }
  };

  const doOrDie = s.empty[R] >= RULES.doOrDieAfter;

  switch (event?.type) {
    case 'RAID': {
      const defenders = count(D);
      const touches = Math.max(0, Math.min(parseInt(event.touches, 10) || 0, defenders));
      let bonus = Boolean(event.bonus);
      if (bonus && defenders < RULES.bonusMinDefenders) {
        bonus = false;
        effects.push({ type: 'BONUS_IGNORED', team: R });
      }
      if (touches === 0 && !bonus) {
        return { error: 'A raid needs at least one touch or a bonus point. Use "Empty raid" if nobody was touched.' };
      }
      const points = touches + (bonus ? 1 : 0);
      kill(D, touches);
      revive(R, touches); // bonus point never revives
      s.score[R] += points;
      s.empty[R] = 0;
      effects.push({
        type: points >= RULES.superRaidMin ? 'SUPER_RAID' : 'RAID',
        team: R, points, touches, bonus,
      });
      if (bonus) effects.push({ type: 'BONUS', team: R });
      checkAllOut(R, D);
      break;
    }
    case 'TACKLE': {
      const sup = count(D) <= RULES.superTackleMax;
      const points = sup ? RULES.superTacklePoints : 1;
      s.score[D] += points;
      kill(R, 1);
      revive(D, 1);
      s.empty[R] = 0;
      effects.push({ type: sup ? 'SUPER_TACKLE' : 'TACKLE', team: D, points });
      checkAllOut(D, R);
      break;
    }
    case 'EMPTY': {
      if (doOrDie) {
        kill(R, 1);
        s.score[D] += 1;
        revive(D, 1);
        s.empty[R] = 0;
        effects.push({ type: 'DO_OR_DIE_FAILED', team: R, points: 1 });
        checkAllOut(D, R);
      } else {
        s.empty[R] += 1;
        effects.push({ type: 'EMPTY_RAID', team: R, count: s.empty[R] });
        if (s.empty[R] >= RULES.doOrDieAfter) effects.push({ type: 'DO_OR_DIE_NEXT', team: R });
      }
      break;
    }
    default:
      return { error: 'Unknown event type' };
  }

  s.raiding = D;
  return { state: s, effects, out, back, raider: R };
}

// One short line for the match log.
export function describe(effects, names, raider) {
  const n = (t) => names[t] || `Team ${t === 0 ? 'A' : 'B'}`;
  const parts = [];
  for (const e of effects) {
    switch (e.type) {
      case 'SUPER_RAID': parts.push(`Super raid! ${n(e.team)} +${e.points}`); break;
      case 'RAID': parts.push(`${n(e.team)} raid +${e.points}`); break;
      case 'BONUS': parts.push('bonus point'); break;
      case 'BONUS_IGNORED': parts.push('bonus line off, ignored'); break;
      case 'SUPER_TACKLE': parts.push(`Super tackle! ${n(e.team)} +${e.points}`); break;
      case 'TACKLE': parts.push(`${n(e.team)} tackle +${e.points}`); break;
      case 'EMPTY_RAID': parts.push(`${n(e.team)} empty raid (${e.count})`); break;
      case 'DO_OR_DIE_NEXT': parts.push(`next raid is do-or-die`); break;
      case 'DO_OR_DIE_FAILED': parts.push(`${n(e.team)} failed do-or-die, ${n(1 - e.team)} +1`); break;
      case 'ALL_OUT': parts.push(`${n(e.team)} all out, ${n(e.by)} +${e.points}`); break;
      default: break;
    }
  }
  return parts.join(', ') || `${n(raider)} raid`;
}
