import { Link } from 'react-router-dom';
import Avatar from './Avatar.jsx';
import { roundLabel, teamName } from '../utils/rounds.js';

export default function MatchResultCard({ match, totalRounds, isDark = false }) {
  const done = match.status === 'finished';
  const live = match.status === 'live';

  const winnerId = String(match.winner?._id || match.winner || '');
  const teamAId = String(match.teamA?._id || match.teamA || '');
  const teamBId = String(match.teamB?._id || match.teamB || '');

  // Determine winner and loser
  let winner = null;
  let winnerScore = 0;
  let loser = null;
  let loserScore = 0;

  if (done) {
    if (winnerId === teamAId || match.scoreA > match.scoreB) {
      winner = match.teamA;
      winnerScore = match.scoreA;
      loser = match.teamB;
      loserScore = match.scoreB;
    } else {
      winner = match.teamB;
      winnerScore = match.scoreB;
      loser = match.teamA;
      loserScore = match.scoreA;
    }
  }

  const pointDiff = Math.abs(winnerScore - loserScore);
  const roundName = roundLabel(match.round, totalRounds, match.isThirdPlace);

  const cardContainer = isDark
    ? match.isThirdPlace
      ? 'bg-slate-900 border-2 border-amber-600/70 text-white shadow-xl'
      : 'bg-slate-900 border-2 border-slate-700 text-white shadow-xl'
    : match.isThirdPlace
    ? 'bg-amber-50/50 border-2 border-amber-500 text-slate-900 shadow-md'
    : 'bg-white border-2 border-slate-200 text-slate-900 shadow-md';

  return (
    <div className={`rounded-2xl p-4 sm:p-5 transition-all ${cardContainer}`}>
      {/* Header: Round & Status Badge */}
      <div className="flex items-center justify-between gap-2 border-b-2 border-slate-200 dark:border-slate-700 pb-3 text-xs">
        <span className="font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
          {match.isThirdPlace ? (
            <span className="rounded bg-amber-700 text-white px-2 py-0.5 text-[10px] font-black uppercase">
              🥉 3rd Place Match
            </span>
          ) : (
            `📍 ${roundName} • Match #${match.matchNumber}`
          )}
        </span>
        {done && (
          <span className={`rounded-full px-3 py-1 font-extrabold text-xs shadow-sm text-white ${
            match.isThirdPlace ? 'bg-amber-700' : 'bg-emerald-600'
          }`}>
            {match.isThirdPlace ? '✓ 3RD PLACE DECIDED' : '✓ MATCH FINISHED'}
          </span>
        )}
        {live && (
          <span className="anim-blink rounded-full bg-red-600 text-white px-3 py-1 font-extrabold text-xs shadow-sm">
            🔴 LIVE MATCH
          </span>
        )}
      </div>

      {done && winner ? (
        <div className="mt-3.5 space-y-3">
          {/* WINNER TEAM ROW - BOLD GREEN */}
          <div className={`flex items-center justify-between gap-3 rounded-xl p-3.5 border-2 ${
            isDark 
              ? 'bg-emerald-950/70 border-emerald-400 text-white' 
              : 'bg-emerald-50 border-emerald-500 text-slate-950'
          }`}>
            <div className="flex items-center gap-3 min-w-0">
              <Avatar src={winner?.logo} name={winner?.name} size="md" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-emerald-600 text-white px-2 py-0.5 text-xs font-black uppercase tracking-wider shadow-sm">
                    🏆 WINNER
                  </span>
                  {winner?.village && (
                    <span className="text-xs font-semibold opacity-75 truncate">({winner.village})</span>
                  )}
                </div>
                <div className="font-display text-xl sm:text-2xl font-black truncate mt-1 text-slate-950 dark:text-white">
                  {teamName(winner)}
                </div>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="font-display text-4xl sm:text-5xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums leading-none">
                {winnerScore}
              </div>
              <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mt-1">
                POINTS
              </div>
            </div>
          </div>

          {/* LOSER / DEFEATED TEAM ROW - BOLD RED/ROSE */}
          <div className={`flex items-center justify-between gap-3 rounded-xl p-3.5 border-2 ${
            isDark 
              ? 'bg-rose-950/50 border-rose-500/50 text-white' 
              : 'bg-rose-50 border-rose-300 text-slate-950'
          }`}>
            <div className="flex items-center gap-3 min-w-0">
              <Avatar src={loser?.logo} name={loser?.name} size="md" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-rose-600 text-white px-2 py-0.5 text-xs font-black uppercase tracking-wider shadow-sm">
                    ❌ DEFEATED
                  </span>
                  {loser?.village && (
                    <span className="text-xs font-semibold opacity-75 truncate">({loser.village})</span>
                  )}
                </div>
                <div className="font-display text-xl sm:text-2xl font-black truncate mt-1 text-slate-800 dark:text-slate-200">
                  {teamName(loser)}
                </div>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="font-display text-4xl sm:text-5xl font-black text-rose-600 dark:text-rose-400 tabular-nums leading-none">
                {loserScore}
              </div>
              <div className="text-xs font-extrabold uppercase tracking-wider text-rose-700 dark:text-rose-300 mt-1">
                POINTS
              </div>
            </div>
          </div>

          {/* VICTORY SUMMARY BAR - HIGH CONTRAST GOLD/AMBER */}
          <div className={`text-center py-2.5 px-3 rounded-xl border-2 text-sm font-black shadow-sm ${
            isDark
              ? 'bg-amber-500/20 border-amber-400 text-amber-300'
              : 'bg-amber-100 border-amber-400 text-amber-950'
          }`}>
            🎉 <span className="underline decoration-2">{teamName(winner)}</span> won by {pointDiff} {pointDiff === 1 ? 'point' : 'points'} ({winnerScore} - {loserScore})
          </div>
        </div>
      ) : (
        /* LIVE OR UPCOMING MATCH */
        <div className="mt-3.5 space-y-2.5">
          <div className="flex items-center justify-between gap-3 rounded-xl p-3.5 bg-blue-50 dark:bg-blue-950/50 border-2 border-blue-300 dark:border-blue-700">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar src={match.teamA?.logo} name={match.teamA?.name} size="md" />
              <div className="font-display text-xl font-black text-slate-900 dark:text-white truncate">
                {teamName(match.teamA)}
              </div>
            </div>
            <div className="font-display text-3xl font-black text-blue-700 dark:text-blue-400 tabular-nums">
              {match.scoreA}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-xl p-3.5 bg-orange-50 dark:bg-orange-950/50 border-2 border-orange-300 dark:border-orange-700">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar src={match.teamB?.logo} name={match.teamB?.name} size="md" />
              <div className="font-display text-xl font-black text-slate-900 dark:text-white truncate">
                {teamName(match.teamB)}
              </div>
            </div>
            <div className="font-display text-3xl font-black text-orange-700 dark:text-orange-400 tabular-nums">
              {match.scoreB}
            </div>
          </div>
        </div>
      )}

      {/* Match details footer link */}
      <div className="mt-3.5 flex items-center justify-between pt-2.5 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
        <span className="font-medium">{match.ground ? `📍 ${match.ground}` : 'Main Kabaddi Ground'}</span>
        <Link to={`/match/${match._id}`} className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
          View Raid Details →
        </Link>
      </div>
    </div>
  );
}
