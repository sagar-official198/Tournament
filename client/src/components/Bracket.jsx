import { useState } from 'react';
import MatchCard from './MatchCard.jsx';
import Avatar from './Avatar.jsx';
import { roundLabel, teamName } from '../utils/rounds.js';

// Responsive Knockout Bracket — scales automatically with team/round count.
export default function Bracket({ matches, totalRounds, tournament }) {
  const [zoom, setZoom] = useState(1); // 0.5 → 1.5

  const regularMatches = matches.filter((m) => !m.isThirdPlace);
  const thirdPlaceMatch = matches.find((m) => m.isThirdPlace);

  const byRound = {};
  regularMatches.forEach((m) => {
    (byRound[m.round] = byRound[m.round] || []).push(m);
  });
  const rounds = Object.keys(byRound).map(Number).sort((a, b) => a - b);

  // Max matches in any round → determines how tall the bracket is
  const maxMatchesInRound = Math.max(...rounds.map((r) => byRound[r].length), 1);

  // Auto-size column width: shrink for many rounds, never below 160px
  const totalCols = rounds.length + (thirdPlaceMatch ? 1 : 0);
  const colWidth = Math.max(160, Math.min(240, Math.floor(900 / totalCols)));

  const champ = tournament?.champion;
  const runner = tournament?.runnerUp;
  const third =
    tournament?.thirdPlaceTeam ||
    (thirdPlaceMatch?.status === 'finished' ? thirdPlaceMatch?.winner : null);

  const zoomLevels = [0.5, 0.65, 0.8, 1, 1.2, 1.5];
  const zoomIn  = () => setZoom((z) => Math.min(1.5, zoomLevels[zoomLevels.indexOf(z) + 1] ?? 1.5));
  const zoomOut = () => setZoom((z) => Math.max(0.5, zoomLevels[zoomLevels.indexOf(z) - 1] ?? 0.5));

  return (
    <div className="space-y-6">

      {/* Zoom Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          🏆 Knockout Bracket • {rounds.length} Round{rounds.length !== 1 ? 's' : ''} • {regularMatches.length} Match{regularMatches.length !== 1 ? 'es' : ''}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-bold">Zoom:</span>
          <button
            type="button"
            onClick={zoomOut}
            disabled={zoom <= 0.5}
            className="rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 border border-slate-600 px-2.5 py-1 text-sm font-black text-white transition"
            title="Zoom out"
          >－</button>
          <span className="text-xs font-black text-amber-400 w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button
            type="button"
            onClick={zoomIn}
            disabled={zoom >= 1.5}
            className="rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 border border-slate-600 px-2.5 py-1 text-sm font-black text-white transition"
            title="Zoom in"
          >＋</button>
          <button
            type="button"
            onClick={() => setZoom(1)}
            className="rounded-lg bg-slate-700 hover:bg-slate-600 border border-slate-500 px-2.5 py-1 text-xs font-black text-white transition"
            title="Reset zoom"
          >Reset</button>
        </div>
      </div>

      {/* Scrollable Bracket Container */}
      <div
        className="rounded-2xl border border-slate-800 bg-slate-950/60 overflow-auto pb-4 cursor-grab active:cursor-grabbing"
        style={{ maxHeight: '70vh' }}
        tabIndex={0}
        aria-label="Tournament bracket — scroll/zoom to navigate"
        onWheel={(e) => {
          // Ctrl+wheel → zoom
          if (e.ctrlKey) {
            e.preventDefault();
            if (e.deltaY < 0) zoomIn(); else zoomOut();
          }
        }}
      >
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
            // Expand the DOM footprint so the scrollable parent tracks true size
            width:  `${Math.round((totalCols * (colWidth + 24) + 24) / zoom)}px`,
            height: `${Math.round((maxMatchesInRound * 120 + 80) / zoom)}px`,
            minHeight: 120,
          }}
        >
          <div
            className="flex items-stretch p-4"
            style={{ gap: 24, width: totalCols * (colWidth + 24) + 24 }}
          >
            {rounds.map((r) => {
              const isFinalRound = r === totalRounds;
              const colMatches = byRound[r];
              return (
                <div
                  key={r}
                  className="flex flex-col"
                  style={{ width: colWidth, minWidth: colWidth }}
                >
                  {/* Round Header */}
                  <div
                    className={`mb-3 text-center text-sm font-black rounded-lg py-1.5 ${
                      isFinalRound
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'bg-slate-800/60 text-slate-300 border border-slate-700/50'
                    }`}
                  >
                    {isFinalRound ? '🏆 ' : ''}{roundLabel(r, totalRounds)}
                    <span className="ml-1.5 text-[10px] font-bold opacity-60">
                      ({colMatches.length}m)
                    </span>
                  </div>

                  {/* Matches — evenly spaced */}
                  <div className="flex flex-1 flex-col justify-around gap-3">
                    {colMatches.map((m) => (
                      <CompactMatchCard
                        key={m._id}
                        match={m}
                        totalRounds={totalRounds}
                        colWidth={colWidth}
                      />
                    ))}
                  </div>
                </div>
              );
            })}

            {/* 3rd-Place Playoff Column */}
            {thirdPlaceMatch && (
              <div
                className="flex flex-col border-l-2 border-dashed border-amber-600/40 pl-6"
                style={{ width: colWidth, minWidth: colWidth }}
              >
                <div className="mb-3 text-center text-sm font-black rounded-lg py-1.5 bg-amber-900/30 text-amber-500 border border-amber-600/40">
                  🥉 3rd Place Playoff
                </div>
                <div className="flex flex-1 flex-col justify-center gap-2">
                  <p className="text-[10px] font-bold text-center text-slate-400">
                    Semi-final losers
                  </p>
                  <CompactMatchCard
                    match={thirdPlaceMatch}
                    totalRounds={totalRounds}
                    colWidth={colWidth}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <p className="text-center text-[11px] text-slate-500 font-medium">
        ← Scroll horizontally to see all rounds &nbsp;•&nbsp; Ctrl+Scroll or use zoom buttons to resize
      </p>

      {/* Official Tournament Podium Standings */}
      {(champ || runner || third || thirdPlaceMatch?.winner) && (
        <div className="rounded-3xl border-2 border-amber-500/40 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="rounded bg-amber-400 text-slate-950 px-2.5 py-0.5 text-xs font-black uppercase tracking-wider">
                PODIUM
              </span>
              <h4 className="font-display text-2xl font-black text-amber-400">
                🏆 OFFICIAL TOURNAMENT STANDINGS (अंतिम परिणाम)
              </h4>
            </div>
            <span className="text-xs font-bold text-slate-400">
              Final standings based on knockout &amp; playoff results
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 items-end">
            {/* 2nd Place */}
            <div className="order-2 sm:order-1 rounded-2xl border-2 border-slate-300 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 p-4 text-center shadow-xl anim-silver-podium shine-sweep">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-200 text-slate-900 px-3.5 py-1 text-xs font-black uppercase tracking-wider shadow">
                <span className="anim-medal-bob">🥈</span> 2ND PLACE / RUNNER-UP
              </span>
              <div className="my-2.5 flex justify-center">
                <Avatar src={runner?.logo} name={runner?.name} size="md" />
              </div>
              <div className="font-display text-xl sm:text-2xl font-black text-white truncate px-1">
                {teamName(runner) || 'Runner-Up'}
              </div>
              <p className="text-xs font-bold text-slate-300 mt-0.5">Final Match Finalist (Runner-Up)</p>
              {tournament?.prizeMoney?.runnerUp > 0 && (
                <div className="font-display text-xl font-black text-slate-200 mt-2 pt-2 border-t border-slate-700/80">
                  ₹{tournament.prizeMoney.runnerUp.toLocaleString('en-IN')}
                </div>
              )}
            </div>

            {/* 1st Place / Champion */}
            <div className="order-1 sm:order-2 rounded-2xl border-4 border-amber-400 bg-gradient-to-b from-amber-950/90 via-slate-950 to-slate-950 p-5 text-center shadow-2xl anim-gold-podium anim-champion-float shine-sweep relative z-10 sm:-translate-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 text-slate-950 px-4 py-1 text-xs font-black uppercase tracking-wider shadow-md">
                <span className="anim-trophy">🏆</span> 🥇 1ST PLACE / CHAMPION
              </span>
              <div className="my-2.5 flex justify-center">
                <Avatar src={champ?.logo} name={champ?.name} size="lg" />
              </div>
              <div className="font-display text-2xl sm:text-4xl font-black text-white truncate px-1">
                {teamName(champ) || 'Champion'}
              </div>
              <p className="text-xs font-bold text-amber-300 mt-0.5">🎉 Final Match Winner • Tournament Champion!</p>
              {tournament?.prizeMoney?.winner > 0 && (
                <div className="font-display text-2xl sm:text-3xl font-black text-amber-400 mt-2 pt-2 border-t border-amber-400/50">
                  ₹{tournament.prizeMoney.winner.toLocaleString('en-IN')}
                </div>
              )}
            </div>

            {/* 3rd Place */}
            <div className="order-3 rounded-2xl border-2 border-amber-600 bg-gradient-to-b from-amber-950/60 via-slate-900 to-slate-950 p-4 text-center shadow-xl anim-bronze-podium shine-sweep">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-600 text-white px-3.5 py-1 text-xs font-black uppercase tracking-wider shadow">
                <span className="anim-medal-bob">🥉</span> 3RD PLACE / BRONZE
              </span>
              <div className="my-2.5 flex justify-center">
                <Avatar src={third?.logo} name={third?.name} size="md" />
              </div>
              <div className="font-display text-xl sm:text-2xl font-black text-amber-400 truncate px-1">
                {teamName(third) || 'Playoff Pending'}
              </div>
              <p className="text-xs font-bold text-amber-300/80 mt-0.5">
                {third ? '3rd-Place Playoff Winner' : 'Semi-Final Losers Playoff'}
              </p>
              {tournament?.prizeMoney?.thirdPlace > 0 && (
                <div className="font-display text-xl font-black text-amber-400 mt-2 pt-2 border-t border-amber-600/50">
                  ₹{tournament.prizeMoney.thirdPlace.toLocaleString('en-IN')}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ----- Compact MatchCard for inside bracket columns -----
function CompactMatchCard({ match, totalRounds, colWidth }) {
  const done = match.status === 'finished';
  const live = match.status === 'live';
  const playedOrLive = live || done;

  const winnerId = String(match.winner?._id || match.winner || '');
  const teamAId  = String(match.teamA?._id  || match.teamA  || '');
  const teamBId  = String(match.teamB?._id  || match.teamB  || '');
  const teamAWon = done && (winnerId === teamAId || match.scoreA > match.scoreB);
  const teamBWon = done && (winnerId === teamBId || match.scoreB > match.scoreA);

  const teamRow = (team, score, won, lost) => (
    <div
      className={`flex items-center justify-between gap-1 px-2 py-1.5 rounded-md text-xs transition-all ${
        won  ? 'bg-emerald-100 border-l-4 border-emerald-600 font-black text-slate-950'
             : lost ? 'bg-rose-50 border-l-4 border-rose-400 text-slate-700'
             : 'bg-slate-50 border-l-4 border-slate-200 text-slate-800'
      }`}
    >
      <span className="truncate font-semibold" style={{ maxWidth: colWidth - 60 }}>
        {won && <span className="mr-1">✅</span>}
        {teamName(team) || (team ? '—' : <span className="italic text-slate-400">TBD</span>)}
      </span>
      <span className={`font-display text-base tabular-nums leading-none font-black ${
        won ? 'text-emerald-700' : lost ? 'text-rose-600' : 'text-slate-600'
      }`}>
        {playedOrLive ? score : '—'}
      </span>
    </div>
  );

  const borderCls = live
    ? 'border-red-500 ring-2 ring-red-400/30 shadow-red-900/40'
    : done
    ? 'border-emerald-400'
    : 'border-slate-700';

  return (
    <div
      className={`rounded-xl border-2 bg-white shadow-md p-2.5 space-y-1 ${borderCls}`}
      style={{ minWidth: 0 }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-1 mb-1">
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider truncate">
          {match.isThirdPlace
            ? '🥉 3rd Playoff'
            : `${roundLabel(match.round, totalRounds)} • M${match.matchNumber}`}
        </span>
        <span className={`text-[9px] font-black rounded px-1.5 py-0.5 uppercase tracking-wider ${
          live  ? 'bg-red-600 text-white animate-pulse'
               : done ? 'bg-emerald-600 text-white'
               : match.bye ? 'bg-slate-300 text-slate-700'
               : 'bg-slate-700 text-slate-200'
        }`}>
          {live ? '🔴 LIVE' : done ? '✓ DONE' : match.bye ? 'BYE' : 'SOON'}
        </span>
      </div>

      {teamRow(match.teamA, match.scoreA, teamAWon, done && !teamAWon && !!match.teamA)}
      {teamRow(match.teamB, match.scoreB, teamBWon, done && !teamBWon && !!match.teamB)}
    </div>
  );
}
