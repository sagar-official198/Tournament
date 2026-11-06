// Kabaddi rules used by the scoring engine (Pro Kabaddi style, 7 a side).
// Change a number here to match your village tournament's own rules.
export const RULES = {
  players: 7,            // players on the mat per team
  doOrDieAfter: 2,       // empty raids in a row before the next raid is do-or-die
  bonusMinDefenders: 6,  // bonus line works only when defence has this many or more
  superTackleMax: 3,     // tackle with this many defenders or fewer = super tackle
  superTacklePoints: 2,
  superRaidMin: 3,       // raid points in one raid for a super raid
  allOutPoints: 2,
  historyLimit: 40,      // how many scorer actions can be undone
  halfDuration: 1200,    // 20 minutes per half in seconds
};
