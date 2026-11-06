import { useEffect, useRef, useState } from 'react';
import StatusBadge from './StatusBadge.jsx';
import PlayerDots from './PlayerDots.jsx';
import { teamName } from '../utils/rounds.js';

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function TimerDisplay({ match }) {
  const timer = match.timer;
  if (!timer || match.status !== 'live') return null;

  // Calculate current time remaining
  const [timeLeft, setTimeLeft] = useState(timer.timeRemaining);

  useEffect(() => {
    if (timer.isPaused) {
      setTimeLeft(timer.timeRemaining);
      return;
    }
    const started = new Date(timer.timerStartedAt).getTime();
    const tick = () => {
      const elapsed = Math.floor((Date.now() - started) / 1000);
      setTimeLeft(Math.max(0, timer.timeRemaining - elapsed));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [timer.isPaused, timer.timeRemaining, timer.timerStartedAt]);

  return (
    <div className="text-center rounded-xl bg-slate-900 border-2 border-amber-400/50 px-3 py-1.5 shadow-lg">
      <div className={`font-display text-3xl font-black tabular-nums tracking-wider ${
        timeLeft <= 60 ? 'text-red-500 anim-blink' : 'text-amber-400'
      }`}>
        {formatTime(timeLeft)}
      </div>
      <div className="text-[11px] font-extrabold uppercase tracking-widest text-amber-300 mt-0.5">
        Half {timer.half} ({Math.round((timer.halfDuration || 900) / 60)}m) {timer.isPaused ? '• PAUSED' : '• RUNNING'}
      </div>
      {timer.halfTimeScoreA !== null && (
        <div className="text-[11px] font-bold text-slate-400 mt-0.5">
          HT: {timer.halfTimeScoreA} - {timer.halfTimeScoreB}
        </div>
      )}
    </div>
  );
}

const TEAM_BAR = ['bg-blue-500', 'bg-orange-500'];
const FULL_TEAM = Array(7).fill(true);

function useChangeCount(value) {
  const prev = useRef(value);
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (prev.current !== value) {
      prev.current = value;
      setCount((c) => c + 1);
    }
  }, [value]);
  return count;
}

function Side({ match, t, fx }) {
  const team = t === 0 ? match.teamA : match.teamB;
  const score = t === 0 ? match.scoreA : match.scoreB;
  const bumps = useChangeCount(score);
  const live = match.status === 'live';
  const done = match.status === 'finished';
  const raiding = live && match.hints?.raidingTeam === t;
  const doOrDie = live && match.hints?.doOrDieTeam === t;
  const allOut = fx?.effects?.some((e) => e.type === 'ALL_OUT' && e.team === t);

  const winnerId = String(match.winner?._id || match.winner || '');
  const teamId = String(team?._id || '');
  const won = done && (winnerId === teamId || (t === 0 ? match.scoreA > match.scoreB : match.scoreB > match.scoreA));
  const lost = done && !won;

  return (
    <div
      key={allOut ? fx.id : 'calm'}
      className={`rounded-2xl border-2 p-3.5 sm:p-5 text-center transition-all ${
        won
          ? 'bg-emerald-950/60 border-emerald-400 shadow-2xl ring-2 ring-emerald-500/40'
          : lost
          ? 'bg-slate-900/60 border-rose-500/30'
          : raiding
          ? 'bg-slate-800 border-amber-400 ring-2 ring-amber-400/40'
          : 'bg-slate-900 border-slate-700'
      } ${allOut ? 'anim-shake' : ''}`}
    >
      <div className={`mx-auto mb-2.5 h-2 w-16 rounded-full shadow-sm ${TEAM_BAR[t]}`} />
      <div className="truncate font-display text-xl sm:text-3xl font-black text-white leading-tight">
        {teamName(team)}
      </div>
      <div className="truncate text-xs font-semibold text-slate-400 mt-0.5">
        {team?.village ? `📍 ${team.village}` : '\u00a0'}
      </div>
      <div className={`my-2 font-display text-6xl sm:text-8xl font-black tabular-nums ${
        won ? 'text-emerald-400' : lost ? 'text-rose-400' : 'text-white'
      }`}>
        <span key={bumps} className={`inline-block ${bumps ? 'anim-bump' : ''}`}>{score}</span>
      </div>
      <PlayerDots
        alive={match.state?.alive?.[t] || FULL_TEAM}
        out={fx?.out?.[t]}
        back={fx?.back?.[t]}
        fxId={fx?.id}
      />
      <div className="mt-3 flex h-7 flex-wrap items-center justify-center gap-2">
        {raiding && (
          <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-black text-slate-950 shadow-md">
            ⚡ RAIDING
          </span>
        )}
        {doOrDie && (
          <span className="anim-blink rounded-full bg-red-600 px-3 py-1 text-xs font-black text-white shadow-md">
            ⚠️ DO OR DIE
          </span>
        )}
        {won && (
          <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-black text-white shadow-lg">
            🏆 WINNER
          </span>
        )}
        {lost && (
          <span className="rounded-full bg-rose-600/80 px-3 py-1 text-xs font-bold text-white shadow-md">
            ❌ DEFEATED
          </span>
        )}
      </div>
    </div>
  );
}

export default function Scoreboard({ match, fx }) {
  return (
    <section className="rounded-3xl bg-slate-950 p-4 sm:p-6 text-white border-2 border-slate-800 shadow-2xl" aria-label="Scoreboard">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6">
        <Side match={match} t={0} fx={fx} />
        <div className="flex flex-col items-center gap-3">
          <TimerDisplay match={match} />
          <StatusBadge status={match.status} />
          <span className="font-display text-2xl font-black text-slate-500">VS</span>
        </div>
        <Side match={match} t={1} fx={fx} />
      </div>
    </section>
  );
}
