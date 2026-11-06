import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge.jsx';
import { roundLabel, teamName, formatWhen } from '../utils/rounds.js';

export default function MatchCard({ match, totalRounds }) {
  const playedOrLive = match.status === 'live' || match.status === 'finished';
  const done = match.status === 'finished';
  const ready = match.teamA && match.teamB;

  const winnerId = String(match.winner?._id || match.winner || '');
  const teamAId = String(match.teamA?._id || match.teamA || '');
  const teamBId = String(match.teamB?._id || match.teamB || '');

  const teamAWon = done && (winnerId === teamAId || match.scoreA > match.scoreB);
  const teamBWon = done && (winnerId === teamBId || match.scoreB > match.scoreA);

  const row = (team, score, isWinner, isLoser) => {
    return (
      <div
        className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg transition-all ${
          isWinner
            ? 'bg-emerald-100 border-l-4 border-emerald-600 text-slate-950 font-black shadow-sm'
            : isLoser
            ? 'bg-rose-50 border-l-4 border-rose-400 text-slate-900 font-medium'
            : 'bg-slate-50 border-l-4 border-slate-300 text-slate-900'
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          {isWinner && (
            <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-black text-white uppercase tracking-wider">
              🏆 WIN
            </span>
          )}
          {isLoser && (
            <span className="rounded bg-rose-600 px-1.5 py-0.5 text-[10px] font-black text-white uppercase tracking-wider">
              ❌ LOSS
            </span>
          )}
          <span className={`truncate text-sm ${isWinner ? 'font-black text-slate-950' : 'font-semibold text-slate-800'}`}>
            {teamName(team)}
          </span>
        </div>
        <span className={`font-display text-2xl tabular-nums leading-none ${
          isWinner ? 'text-emerald-700 font-black' : isLoser ? 'text-rose-600 font-bold' : 'text-slate-800 font-bold'
        }`}>
          {playedOrLive ? score : '-'}
        </span>
      </div>
    );
  };

  const winnerName = teamAWon ? teamName(match.teamA) : teamBWon ? teamName(match.teamB) : null;
  const pointDiff = Math.abs(match.scoreA - match.scoreB);

  const body = (
    <>
      <div className="mb-2 flex items-center justify-between gap-2 text-xs font-bold text-slate-600">
        <span className="uppercase tracking-wide flex items-center gap-1.5">
          {match.isThirdPlace ? (
            <span className="rounded bg-amber-700 text-white px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
              🥉 3RD PLACE PLAYOFF
            </span>
          ) : (
            `${roundLabel(match.round, totalRounds)} • Match ${match.matchNumber}`
          )}
        </span>
        {match.bye ? <span className="rounded bg-slate-300 text-slate-900 px-2 py-0.5 font-bold">BYE</span> : <StatusBadge status={match.status} />}
      </div>

      <div className="space-y-1.5">
        {row(match.teamA, match.scoreA, teamAWon, done && !teamAWon)}
        {row(match.teamB, match.scoreB, teamBWon, done && !teamBWon)}
      </div>

      {done && winnerName && (
        <div className={`mt-2.5 rounded-lg border px-2 py-1 text-center text-xs font-black shadow-sm ${
          match.isThirdPlace
            ? 'bg-amber-100 border-amber-600 text-amber-950'
            : 'bg-amber-100 border-amber-400 text-amber-950'
        }`}>
          {match.isThirdPlace ? '🥉 3rd Place Winner' : '🏆 Winner'}: {winnerName} by {pointDiff} pts ({match.scoreA} - {match.scoreB})
        </div>
      )}

      {!match.bye && !done && (
        <div className="mt-2 text-xs font-medium text-slate-500">
          {formatWhen(match.scheduledAt)}{match.ground ? `, ${match.ground}` : ''}
        </div>
      )}
    </>
  );

  const base = `block rounded-xl border-2 bg-white p-3.5 shadow-md transition-all ${
    match.status === 'live' 
      ? 'border-red-500 ring-2 ring-red-400/30' 
      : done 
      ? 'border-emerald-400' 
      : 'border-slate-200'
  }`;

  return ready && !match.bye ? (
    <Link to={`/match/${match._id}`} className={`${base} hover:border-slate-400 hover:shadow-lg`}>
      {body}
    </Link>
  ) : (
    <div className={base}>{body}</div>
  );
}
