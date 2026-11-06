// Knockout bracket builder. Pure function, no database.
// A team that loses is out. If the team count is not a power of 2,
// some teams get a bye (they skip round 1 and go straight to round 2).

export const nextPow2 = (n) => {
  let p = 1;
  while (p < n) p *= 2;
  return p;
};

export function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Returns { matches, rounds, size }.
// Each match: { round, matchNumber, teamA, teamB, nextIndex, nextSlot, bye, winner, isThirdPlace, label }
// nextIndex is the index (inside `matches`) of the match the winner moves to.
export function buildBracket(teamIds, { shuffleTeams = true, includeThirdPlace = false } = {}) {
  const n = teamIds.length;
  if (n < 2) throw new Error('At least 2 teams are needed to make a bracket.');

  const teams = shuffleTeams ? shuffle(teamIds) : [...teamIds];
  const size = nextPow2(n);
  const rounds = Math.log2(size);
  const half = size / 2;

  const matches = [];
  const byRound = {};
  let inRound = half;
  for (let r = 1; r <= rounds; r++) {
    byRound[r] = [];
    for (let m = 0; m < inRound; m++) {
      byRound[r].push(matches.length);
      matches.push({
        round: r,
        matchNumber: m + 1,
        teamA: null,
        teamB: null,
        nextIndex: null,
        nextSlot: null,
        bye: false,
        winner: null,
        isThirdPlace: false,
        label: r === rounds ? 'Final' : r === rounds - 1 ? `Semifinal ${m + 1}` : '',
      });
    }
    inRound /= 2;
  }

  for (let r = 1; r < rounds; r++) {
    byRound[r].forEach((mi, j) => {
      matches[mi].nextIndex = byRound[r + 1][Math.floor(j / 2)];
      matches[mi].nextSlot = j % 2 === 0 ? 'A' : 'B';
    });
  }

  // If includeThirdPlace is true and rounds >= 2 (there are semi-finals), add the 3rd-place playoff match!
  if (includeThirdPlace && rounds >= 2) {
    matches.push({
      round: rounds,
      matchNumber: 2,
      teamA: null,
      teamB: null,
      nextIndex: null,
      nextSlot: null,
      bye: false,
      winner: null,
      isThirdPlace: true,
      label: '3rd Place Playoff',
    });
  }

  // Round 1: first half of the list plays the second half. Missing opponent = bye.
  byRound[1].forEach((mi, i) => {
    matches[mi].teamA = teams[i];
    matches[mi].teamB = teams[half + i] ?? null;
  });

  // A bye winner moves up straight away.
  for (const mi of byRound[1]) {
    const m = matches[mi];
    if (m.teamA && !m.teamB) {
      m.bye = true;
      m.winner = m.teamA;
      if (m.nextIndex !== null) {
        matches[m.nextIndex][m.nextSlot === 'A' ? 'teamA' : 'teamB'] = m.winner;
      }
    }
  }

  return { matches, rounds, size };
}
