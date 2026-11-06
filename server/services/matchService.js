import Match from '../models/Match.js';
import Tournament from '../models/Tournament.js';
import { emitMatch, emitBracket } from './realtime.js';

export const TEAM_FIELDS = 'name village logo teamPhoto';

export const populateMatch = (query) =>
  query.populate('teamA', TEAM_FIELDS).populate('teamB', TEAM_FIELDS).populate('winner', 'name');

export async function loadMatch(id) {
  return populateMatch(Match.findById(id));
}

// Winner of a finished match moves into its slot in the next round.
// Semi-final losers move into the 3rd-Place Playoff match.
// Final match winner is Champion (1st), loser is Runner-Up (2nd).
// 3rd-Place Playoff match winner is 3rd Place.
export async function advanceWinner(match) {
  const tournament = await Tournament.findById(match.tournament);
  if (!tournament) return;

  const winner = match.winner;
  const loser = String(winner) === String(match.teamA) ? match.teamB : match.teamA;

  // Case 1: 3rd-Place Playoff match finished
  if (match.isThirdPlace) {
    tournament.thirdPlaceTeam = winner;
    const finalMatch = await Match.findOne({
      tournament: match.tournament,
      round: match.round,
      isThirdPlace: false,
    });
    if (finalMatch && finalMatch.status === 'finished') {
      tournament.status = 'completed';
    }
    await tournament.save();
    emitBracket(match.tournament);
    return;
  }

  // Case 2: Final match finished (has no nextMatch and is not 3rd place match)
  if (!match.nextMatch) {
    tournament.champion = winner;
    tournament.runnerUp = loser;
    const thirdPlaceMatch = await Match.findOne({
      tournament: match.tournament,
      isThirdPlace: true,
    });
    if (!thirdPlaceMatch || thirdPlaceMatch.status === 'finished') {
      tournament.status = 'completed';
    }
    await tournament.save();
    emitBracket(match.tournament);
    return;
  }

  // Case 3: Regular match advancing winner to nextMatch
  const next = await Match.findById(match.nextMatch);
  if (next) {
    next[match.nextSlot === 'A' ? 'teamA' : 'teamB'] = winner;
    if (next.teamA && next.teamB && next.status === 'waiting') next.status = 'upcoming';
    await next.save();
    emitMatch(await loadMatch(next._id).then((m) => m.toJSON()));
  }

  // Case 4: Semi-Final match finished -> advance the LOSER to the 3rd-Place Playoff match!
  const isSemiFinal = match.round === tournament.rounds - 1 && !match.isThirdPlace;
  if (isSemiFinal && loser) {
    const thirdPlaceMatch = await Match.findOne({
      tournament: match.tournament,
      isThirdPlace: true,
    });
    if (thirdPlaceMatch) {
      const slot = match.matchNumber === 1 ? 'teamA' : 'teamB';
      thirdPlaceMatch[slot] = loser;
      if (thirdPlaceMatch.teamA && thirdPlaceMatch.teamB && thirdPlaceMatch.status === 'waiting') {
        thirdPlaceMatch.status = 'upcoming';
      }
      await thirdPlaceMatch.save();
      emitMatch(await loadMatch(thirdPlaceMatch._id).then((m) => m.toJSON()));
    }
  }

  emitBracket(match.tournament);
}
