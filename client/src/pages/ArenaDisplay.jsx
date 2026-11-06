import { useEffect, useRef, useState, useCallback } from 'react';
import { useTournament } from '../hooks/useTournament.js';
import { useLiveMatch } from '../hooks/useLiveMatch.js';
import Scoreboard from '../components/Scoreboard.jsx';
import Bracket from '../components/Bracket.jsx';
import MatchResultCard from '../components/MatchResultCard.jsx';
import EventBanner from '../components/EventBanner.jsx';
import Avatar from '../components/Avatar.jsx';
import { Loading, Empty } from '../components/Feedback.jsx';
import { teamName, roundLabel } from '../utils/rounds.js';
import { api } from '../api/api.js';

function LiveMatchView({ matchId }) {
  const { match, fx } = useLiveMatch(matchId);
  if (!match) {
    return (
      <div className="py-20 text-center">
        <Loading text="Connecting to live scoreboard..." />
      </div>
    );
  }
  const names = [match.teamA?.name, match.teamB?.name];

  return (
    <div className="mx-auto max-w-4xl py-2 sm:py-4">
      <div className="scale-100 transform sm:scale-105">
        <Scoreboard match={match} fx={fx} />
      </div>
      <div className="mt-6">
        <EventBanner fx={fx} names={names} />
      </div>
    </div>
  );
}

// Reusable Player Awards Showcase Component (Best Raider & Best Defender)
// Shows names ONLY when admin has publicly revealed them (isAnnounced = true)
function PlayerAwardsBanner({ tournament }) {
  const awards = tournament?.awards;
  const prizes = tournament?.prizeMoney;
  const isRevealed = Boolean(awards?.isAnnounced);
  const hasRaider = Boolean(awards?.bestRaider?.playerName || prizes?.bestRaider > 0);
  const hasDefender = Boolean(awards?.bestDefender?.playerName || prizes?.bestDefender > 0);

  if (!hasRaider && !hasDefender) return null;

  return (
    <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-3 sm:p-3.5 shadow-xl text-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-1.5 mb-2">
        <div className="flex items-center gap-2">
          <span className="rounded bg-amber-400 text-slate-950 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
            ⭐ AWARDS & HONORS
          </span>
          <h3 className="font-display text-sm sm:text-base font-black text-amber-400">
            TOURNAMENT BEST PLAYERS (सर्वश्रेष्ठ खिलाड़ी)
          </h3>
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-black tracking-wider shadow ${
          isRevealed ? 'bg-emerald-600 text-white' : 'bg-amber-100 text-amber-950 border border-amber-400'
        }`}>
          {isRevealed ? '✅ OFFICIAL WINNERS REVEALED' : '🔒 ANNOUNCEMENT AT CLOSING CEREMONY'}
        </span>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2">
        {hasRaider && (
          <div className="rounded-xl border border-blue-500/80 bg-gradient-to-b from-blue-950/70 to-slate-900 p-2.5 sm:p-3 shadow-md flex items-center justify-between">
            <div>
              <span className="rounded-full bg-blue-500 text-white px-2 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-sm">
                ⚡ BEST RAIDER AWARD
              </span>
              {isRevealed ? (
                <>
                  <div className="font-display text-lg sm:text-2xl font-black text-white mt-1 leading-tight">
                    {awards?.bestRaider?.playerName}
                  </div>
                  {awards?.bestRaider?.teamName && (
                    <p className="text-xs font-bold text-blue-300">Team: {awards.bestRaider.teamName}</p>
                  )}
                </>
              ) : (
                <div className="font-display text-xs sm:text-sm font-bold text-slate-400 mt-1 flex items-center gap-1.5">
                  <span>🔒</span> Will be announced at Closing Ceremony
                </div>
              )}
            </div>
            {prizes?.bestRaider > 0 && (
              <div className="text-right pl-2">
                <span className="text-[9px] font-black uppercase tracking-wider text-blue-300">AWARD PRIZE</span>
                <div className="font-display text-base sm:text-xl font-black text-blue-400 tabular-nums">
                  ₹{prizes.bestRaider.toLocaleString('en-IN')}
                </div>
              </div>
            )}
          </div>
        )}

        {hasDefender && (
          <div className="rounded-xl border border-purple-500/80 bg-gradient-to-b from-purple-950/70 to-slate-900 p-2.5 sm:p-3 shadow-md flex items-center justify-between">
            <div>
              <span className="rounded-full bg-purple-500 text-white px-2 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-sm">
                🛡️ BEST DEFENDER AWARD
              </span>
              {isRevealed ? (
                <>
                  <div className="font-display text-lg sm:text-2xl font-black text-white mt-1 leading-tight">
                    {awards?.bestDefender?.playerName}
                  </div>
                  {awards?.bestDefender?.teamName && (
                    <p className="text-xs font-bold text-purple-300">Team: {awards.bestDefender.teamName}</p>
                  )}
                </>
              ) : (
                <div className="font-display text-xs sm:text-sm font-bold text-slate-400 mt-1 flex items-center gap-1.5">
                  <span>🔒</span> Will be announced at Closing Ceremony
                </div>
              )}
            </div>
            {prizes?.bestDefender > 0 && (
              <div className="text-right pl-2">
                <span className="text-[9px] font-black uppercase tracking-wider text-purple-300">AWARD PRIZE</span>
                <div className="font-display text-base sm:text-xl font-black text-purple-400 tabular-nums">
                  ₹{prizes.bestDefender.toLocaleString('en-IN')}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Complete Olympic 3-Step Podium Component (1st, 2nd, 3rd side-by-side with distinct animations, NO SCROLL)
function TournamentPodium({ tournament, matches }) {
  const champ = tournament?.champion;
  const runner = tournament?.runnerUp;
  const third = tournament?.thirdPlaceTeam;
  const thirdMatch = matches.find((m) => m.isThirdPlace);
  const thirdTeam = third || (thirdMatch?.winner ? thirdMatch.winner : null);

  if (!champ && !runner && !thirdTeam && !thirdMatch) return null;

  return (
    <div className="w-full">
      {/* Celebratory Banner */}
      <div className="mb-3 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 text-slate-950 px-5 py-1 text-xs font-black uppercase tracking-widest shadow-lg">
          <span className="anim-sparkle">✨</span>
          OFFICIAL TOURNAMENT PODIUM (विजेता पोडियम)
          <span className="anim-sparkle">✨</span>
        </span>
        <div className="text-amber-300 font-display text-sm sm:text-base font-black mt-1">
          🎉 HEARTIEST CONGRATULATIONS TO ALL TEAMS & MEDALISTS! 🎉
        </div>
      </div>

      {/* 3-Tier Side-by-Side Olympic Podium (2nd on Left, 1st in Center, 3rd on Right) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 lg:gap-5 items-end max-w-6xl mx-auto">
        {/* ================= 2ND PLACE (SILVER / RUNNER-UP) ================= */}
        <div className="order-2 md:order-1 flex flex-col items-center">
          <div className="w-full rounded-2xl border-2 border-slate-300 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 p-4 text-center shadow-2xl anim-silver-podium shine-sweep">
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <span className="anim-medal-bob text-2xl">🥈</span>
              <span className="rounded-full bg-slate-200 text-slate-900 px-3 py-0.5 text-[11px] font-black uppercase tracking-wider shadow">
                2ND PLACE • RUNNER-UP
              </span>
            </div>

            <div className="my-2 flex justify-center">
              <Avatar src={runner?.logo} name={runner?.name} size="md" />
            </div>

            <div className="font-display text-2xl sm:text-3xl font-black text-slate-100 truncate px-1">
              {teamName(runner) || 'Runner-Up'}
            </div>

            {runner?.village && (
              <p className="text-xs font-bold text-slate-300 mt-0.5">📍 {runner.village}</p>
            )}

            <p className="text-[11px] font-bold text-slate-400 mt-1">Final Match Runner-Up</p>

            {tournament.prizeMoney?.runnerUp > 0 && (
              <div className="mt-2.5 pt-2 border-t border-slate-700/80">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">PRIZE MONEY</span>
                <div className="font-display text-xl sm:text-2xl font-black text-slate-200">
                  ₹{tournament.prizeMoney.runnerUp.toLocaleString('en-IN')}
                </div>
              </div>
            )}
          </div>

          {/* Silver Pedestal Step */}
          <div className="w-full h-12 sm:h-14 bg-gradient-to-t from-slate-900 to-slate-700 rounded-b-xl border-x-2 border-b-2 border-slate-400 flex items-center justify-center shadow-lg">
            <span className="font-display text-2xl sm:text-3xl font-black text-slate-300 tracking-wider">
              2
            </span>
          </div>
        </div>

        {/* ================= 1ST PLACE (GOLD / TOURNAMENT CHAMPION) ================= */}
        <div className="order-1 md:order-2 flex flex-col items-center relative z-10 md:-translate-y-2">
          {/* Floating Crown / Stars */}
          <div className="flex items-center gap-1 mb-1 anim-sparkle text-amber-300 text-lg sm:text-xl">
            <span>✨</span>
            <span className="text-2xl">👑</span>
            <span>✨</span>
          </div>

          <div className="w-full rounded-3xl border-4 border-amber-400 bg-gradient-to-b from-amber-950/90 via-slate-950 to-slate-950 p-4 sm:p-5 text-center shadow-2xl anim-gold-podium anim-champion-float shine-sweep">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="anim-trophy text-3xl">🏆</span>
              <span className="rounded-full bg-amber-400 text-slate-950 px-3.5 py-0.5 text-xs font-black uppercase tracking-widest shadow-md">
                🥇 1ST PLACE • CHAMPION
              </span>
            </div>

            <div className="my-2 flex justify-center">
              <Avatar src={champ?.logo} name={champ?.name} size="lg" />
            </div>

            <div className="font-display text-3xl sm:text-5xl font-black text-white leading-tight tracking-wide truncate px-1">
              {champ?.name || 'Tournament Winner'}
            </div>

            {champ?.village && (
              <p className="text-xs sm:text-sm font-bold text-amber-300 mt-0.5">📍 {champ.village}</p>
            )}

            <p className="text-xs font-black text-amber-400 mt-1 uppercase tracking-wide">
              🏆 Grand Final Winner & Champion!
            </p>

            {tournament.prizeMoney?.winner > 0 && (
              <div className="mt-3 pt-2.5 border-t border-amber-400/50">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">PRIZE MONEY + GOLD CUP</span>
                <div className="font-display text-2xl sm:text-4xl font-black text-amber-300">
                  ₹{tournament.prizeMoney.winner.toLocaleString('en-IN')}
                </div>
              </div>
            )}
          </div>

          {/* Gold Tall Pedestal Step */}
          <div className="w-full h-16 sm:h-20 bg-gradient-to-t from-amber-900 via-amber-700 to-amber-500 rounded-b-2xl border-x-4 border-b-4 border-amber-400 flex items-center justify-center shadow-xl">
            <span className="font-display text-3xl sm:text-4xl font-black text-slate-950 tracking-wider">
              1
            </span>
          </div>
        </div>

        {/* ================= 3RD PLACE (BRONZE / PLAYOFF WINNER) ================= */}
        <div className="order-3 flex flex-col items-center">
          <div className="w-full rounded-2xl border-2 border-amber-600 bg-gradient-to-b from-amber-950/60 via-slate-900 to-slate-950 p-4 text-center shadow-2xl anim-bronze-podium shine-sweep">
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <span className="anim-medal-bob text-2xl">🥉</span>
              <span className="rounded-full bg-amber-600 text-white px-3 py-0.5 text-[11px] font-black uppercase tracking-wider shadow">
                3RD PLACE • PLAYOFF
              </span>
            </div>

            <div className="my-2 flex justify-center">
              <Avatar src={thirdTeam?.logo} name={thirdTeam?.name} size="md" />
            </div>

            <div className="font-display text-2xl sm:text-3xl font-black text-amber-400 truncate px-1">
              {teamName(thirdTeam) || (thirdMatch?.winner ? teamName(thirdMatch.winner) : 'Playoff Winner')}
            </div>

            {thirdTeam?.village && (
              <p className="text-xs font-bold text-amber-300 mt-0.5">📍 {thirdTeam.village}</p>
            )}

            <p className="text-[11px] font-bold text-amber-300/80 mt-1">3rd-Place Playoff Winner</p>

            {tournament.prizeMoney?.thirdPlace > 0 && (
              <div className="mt-2.5 pt-2 border-t border-amber-600/50">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">PRIZE MONEY</span>
                <div className="font-display text-xl sm:text-2xl font-black text-amber-400">
                  ₹{tournament.prizeMoney.thirdPlace.toLocaleString('en-IN')}
                </div>
              </div>
            )}
          </div>

          {/* Bronze Pedestal Step */}
          <div className="w-full h-9 sm:h-11 bg-gradient-to-t from-amber-950 to-amber-800 rounded-b-xl border-x-2 border-b-2 border-amber-600 flex items-center justify-center shadow-lg">
            <span className="font-display text-xl sm:text-2xl font-black text-amber-300 tracking-wider">
              3
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ArenaDisplay() {
  const { tournament, matches, loading } = useTournament();
  const [teams, setTeams] = useState([]);
  const [clock, setClock] = useState(new Date().toLocaleTimeString());
  const [localScreen, setLocalScreen] = useState(null); // null means follow admin broadcast
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);

  // Track browser fullscreen state changes (ESC key auto-exits)
  useEffect(() => {
    const onFsChange = () => {
      const fs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement);
      setIsFullscreen(fs);
      if (!fs) setShowControls(true); // restore toolbar when exiting fullscreen
    };
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
    document.addEventListener('mozfullscreenchange', onFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange);
      document.removeEventListener('mozfullscreenchange', onFsChange);
    };
  }, []);

  const enterFullscreen = useCallback(async () => {
    const el = containerRef.current || document.documentElement;
    try {
      if (el.requestFullscreen) await el.requestFullscreen();
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
      else if (el.mozRequestFullScreen) await el.mozRequestFullScreen();
      setShowControls(false); // hide toolbar in fullscreen
    } catch (e) {
      console.warn('Fullscreen failed:', e);
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.exitFullscreen) await document.exitFullscreen();
      else if (document.webkitExitFullscreen) await document.webkitExitFullscreen();
      else if (document.mozCancelFullScreen) await document.mozCancelFullScreen();
    } catch (e) {
      console.warn('Exit fullscreen failed:', e);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    api.get('/teams').then(setTeams).catch(() => {});
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <Loading text="Loading Arena Screen..." />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <Empty title="No active tournament found">
          Please create and draw a tournament in the Admin Panel.
        </Empty>
      </div>
    );
  }

  const cfg = tournament.displayConfig || {
    activeScreen: 'auto',
    announcement: '',
    showPrizeMoney: true,
    showOrganizer: true,
    showMembers: true,
    showTicker: true,
    featuredMatch: null,
  };

  const realMatches = matches.filter((m) => !m.bye);
  const liveMatches = realMatches.filter((m) => m.status === 'live');
  const finishedMatches = realMatches.filter((m) => m.status === 'finished').reverse();
  const upcomingMatches = realMatches.filter((m) => m.status === 'upcoming');

  const activeMatch = cfg.featuredMatch
    ? realMatches.find((m) => String(m._id) === String(cfg.featuredMatch)) || liveMatches[0] || upcomingMatches[0] || finishedMatches[0]
    : liveMatches[0] || upcomingMatches[0] || finishedMatches[0];

  let mode = localScreen || cfg.activeScreen || 'auto';
  if (mode === 'auto') {
    if (liveMatches.length > 0) {
      mode = 'live_match';
    } else if (tournament.status === 'completed' || tournament.champion) {
      mode = 'ceremony';
    } else if (finishedMatches.length > 0) {
      mode = 'bracket';
    } else {
      mode = 'welcome';
    }
  }

  const broadcastScreens = [
    { id: 'auto', label: '🔄 Auto', hint: 'Smart auto-follow' },
    { id: 'live_match', label: '🔴 Live Score', hint: 'Live scoreboard' },
    { id: 'results', label: '📊 Results', hint: 'Completed match scores' },
    { id: 'bracket', label: '🏆 Bracket', hint: 'Tournament tree & 3rd place' },
    { id: 'ceremony', label: '🎉 Ceremony', hint: 'Podium & awards reveal' },
    { id: 'welcome', label: '💰 Prizes & Org', hint: 'Organizer & prizes' },
    { id: 'teams', label: '👥 Teams', hint: 'Team roster' },
    { id: 'announcement', label: '📢 Notice', hint: 'Fullscreen banner' },
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-slate-950 text-white flex flex-col justify-between selection:bg-amber-400 selection:text-slate-950 font-sans" style={isFullscreen ? { height: '100vh', overflowY: 'auto' } : {}}>
      {/* Top Arena Header Bar — hidden in fullscreen when controls are hidden */}
      {(!isFullscreen || showControls) && (
      <header className="border-b-2 border-amber-500/30 bg-slate-900/95 px-4 py-3 sm:px-6 shadow-xl backdrop-blur sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-amber-400 px-3 py-1 font-display text-xs sm:text-sm font-black tracking-widest text-slate-950 shadow-md">
              ARENA SCREEN
            </span>
            <h1 className="font-display text-xl sm:text-3xl font-black tracking-wide text-white">
              {tournament.name} <span className="text-amber-400">{tournament.year}</span>
            </h1>
          </div>

          {/* Center: Live Screen Controller Toolbar */}
          <div className="flex items-center gap-2">
            {showControls && (
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-700/80">
                {broadcastScreens.map((s) => {
                  const isActive = (localScreen ? localScreen === s.id : cfg.activeScreen === s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setLocalScreen(s.id === cfg.activeScreen ? null : s.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                        isActive
                          ? 'bg-amber-400 text-slate-950 shadow-md ring-1 ring-amber-300'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800'
                      }`}
                      title={s.hint}
                    >
                      {s.label}
                    </button>
                  );
                })}
                {localScreen && (
                  <button
                    type="button"
                    onClick={() => setLocalScreen(null)}
                    className="ml-1 rounded-md bg-emerald-600 px-2 py-0.5 text-[11px] font-black text-white hover:bg-emerald-500 shadow-sm"
                    title="Reset to follow Admin broadcast"
                  >
                    ⚡ Follow Admin
                  </button>
                )}
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowControls(!showControls)}
              className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded border border-slate-800"
              title="Toggle Screen Toolbar"
            >
              {showControls ? '▲ Hide' : '▼ Toolbar'}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 px-2.5 py-1 text-xs font-black text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 anim-blink"></span>
              LIVE SYNC
            </span>
            <span className="rounded-full bg-slate-800 px-3 py-1 font-mono text-xs sm:text-sm font-bold text-amber-300 border border-slate-700">
              🕒 {clock}
            </span>
            {/* Fullscreen Toggle Button */}
            <button
              type="button"
              onClick={isFullscreen ? exitFullscreen : enterFullscreen}
              className="rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 px-2.5 py-1 text-xs font-black text-white transition flex items-center gap-1.5"
              title={isFullscreen ? 'Exit Fullscreen (ESC)' : 'Enter Fullscreen (Full Screen Mode)'}
            >
              {isFullscreen ? '⊠ Exit FS' : '⛶ Full Screen'}
            </button>
          </div>
        </div>
      </header>
      )}

      {/* Floating fullscreen ESC hint + re-show toolbar button (only in fullscreen) */}
      {isFullscreen && !showControls && (
        <button
          type="button"
          onClick={() => setShowControls(true)}
          className="fixed top-2 right-3 z-50 rounded-lg bg-slate-900/70 hover:bg-slate-800 text-slate-400 hover:text-white text-[11px] px-2.5 py-1 border border-slate-700 backdrop-blur transition opacity-30 hover:opacity-100"
          title="Show toolbar"
        >
          ☰ Toolbar
        </button>
      )}

      {/* Sticky Live Match Alert when another screen is active */}
      {mode !== 'live_match' && liveMatches.length > 0 && (
        <div className="bg-gradient-to-r from-red-900 via-red-700 to-red-900 border-b-2 border-red-500 px-4 py-2 text-white shadow-xl">
          <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="anim-blink rounded bg-white px-2 py-0.5 text-xs font-black text-red-700">
                🔴 LIVE MATCH NOW
              </span>
              <span className="font-display text-lg font-black">
                {teamName(liveMatches[0].teamA)} <span className="text-amber-300 font-black">{liveMatches[0].scoreA}</span> - <span className="text-amber-300 font-black">{liveMatches[0].scoreB}</span> {teamName(liveMatches[0].teamB)}
              </span>
              <span className="text-xs font-bold text-red-200">
                (Half {liveMatches[0].timer?.half || 1} • {liveMatches[0].timer?.isPaused ? 'Paused' : 'Running'})
              </span>
            </div>
            <button
              type="button"
              onClick={() => setLocalScreen('live_match')}
              className="rounded-lg bg-white text-red-700 px-3 py-1 text-xs font-black hover:bg-amber-300 transition shadow"
            >
              📺 View Live Match Fullscreen →
            </button>
          </div>
        </div>
      )}

      {/* Main Stage Content */}
      <main className="flex-1 px-4 py-6 sm:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Mode 1: Live Match Scoreboard */}
          {mode === 'live_match' && (
            <div className="space-y-8">
              <div className="text-center">
                {activeMatch?.status === 'live' ? (
                  <span className="anim-blink inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-2 text-sm sm:text-base font-black text-white shadow-2xl border-2 border-red-400 tracking-wide">
                    <span className="h-3 w-3 rounded-full bg-white"></span>
                    🔴 LIVE MATCH BROADCAST • REAL-TIME SCORING
                  </span>
                ) : activeMatch?.status === 'finished' ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-2 text-sm sm:text-base font-black text-white shadow-xl border-2 border-emerald-400">
                    🏆 MATCH COMPLETED • OFFICIAL RESULT
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-6 py-2 text-sm sm:text-base font-black text-slate-950 shadow-xl border-2 border-amber-300">
                    ⚡ UPCOMING MATCH • READY TO START
                  </span>
                )}
              </div>

              {activeMatch ? (
                <div className="space-y-8">
                  <LiveMatchView matchId={activeMatch._id} />

                  {/* Player Awards Bar if entered */}
                  <PlayerAwardsBanner tournament={tournament} />

                  {/* Context Bar below live scoreboard */}
                  <div className="border-t border-slate-800 pt-6">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                      <h3 className="font-display text-xl sm:text-2xl font-black text-amber-400">
                        🏆 TOURNAMENT MATCH SUMMARY
                      </h3>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                        <span>{finishedMatches.length} Matches Completed</span>
                        <span>•</span>
                        <span>{upcomingMatches.length} Upcoming</span>
                      </div>
                    </div>

                    {finishedMatches.length > 0 ? (
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {finishedMatches.slice(0, 3).map((m) => (
                          <MatchResultCard key={m._id} match={m} totalRounds={tournament.rounds} isDark={true} />
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-center text-slate-400 text-sm">
                        This is the first match of the tournament. Results will appear as soon as matches conclude.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="rounded-3xl border-2 border-slate-800 bg-slate-900/90 py-16 px-6 text-center shadow-2xl max-w-3xl mx-auto">
                    <span className="rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 px-4 py-1 text-xs font-black uppercase tracking-wider">
                      NO MATCH CURRENTLY LIVE
                    </span>
                    <h3 className="text-3xl sm:text-5xl font-display font-black text-white mt-4">
                      Next Match Starting Shortly
                    </h3>
                    <p className="text-slate-300 text-base mt-2 max-w-lg mx-auto">
                      The live scoreboard will automatically pop up with real-time points the instant referee starts the next match.
                    </p>
                    {finishedMatches.length > 0 && (
                      <div className="mt-8 pt-6 border-t border-slate-800">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                          Latest Completed Match Result:
                        </p>
                        <div className="max-w-md mx-auto">
                          <MatchResultCard match={finishedMatches[0]} totalRounds={tournament.rounds} isDark={true} />
                        </div>
                      </div>
                    )}
                  </div>

                  <PlayerAwardsBanner tournament={tournament} />
                </div>
              )}
            </div>
          )}

          {/* Mode 2: Tournament Knockout Bracket & Results */}
          {mode === 'bracket' && (
            <div className="space-y-8">
              <div>
                <div className="mb-4 text-center">
                  <span className="rounded-full bg-amber-400 text-slate-950 px-4 py-1 text-xs font-black tracking-widest uppercase shadow-md">
                    OFFICIAL KNOCKOUT BRACKET & 3RD-PLACE PLAYOFF
                  </span>
                  <h2 className="font-display text-3xl sm:text-5xl text-amber-400 font-black mt-2">
                    TOURNAMENT ELIMINATION TREE
                  </h2>
                  <p className="text-slate-300 font-medium mt-1">
                    Winners advance to the next round • Semi-final losers play for 3rd place!
                  </p>
                </div>
                <div className="rounded-3xl border-2 border-slate-700 bg-slate-950 p-6 shadow-2xl">
                  <Bracket matches={matches} totalRounds={tournament.rounds} tournament={tournament} />
                </div>
              </div>

              {/* Player Awards Showcase */}
              <PlayerAwardsBanner tournament={tournament} />

              {/* Completed Match Results Grid below Bracket */}
              {finishedMatches.length > 0 && (
                <div>
                  <div className="mb-4 flex items-center justify-between border-b-2 border-amber-400/30 pb-3">
                    <div>
                      <h3 className="font-display text-2xl sm:text-3xl text-amber-400 font-black">
                        🏆 RECENT MATCH RESULTS & SCORES
                      </h3>
                      <p className="text-sm text-slate-300 font-medium">
                        Official breakdown of winner team, defeated team, and points
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-600 text-white px-4 py-1 text-xs font-black shadow-md">
                      {finishedMatches.length} Matches Completed
                    </span>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {finishedMatches.map((m) => (
                      <MatchResultCard key={m._id} match={m} totalRounds={tournament.rounds} isDark={true} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mode: Dedicated Match Results Scoreboard (मैच परिणाम) */}
          {mode === 'results' && (
            <div className="space-y-8">
              <div className="text-center">
                <span className="rounded-full bg-emerald-600 px-4 py-1 text-xs font-black text-white shadow-md uppercase tracking-widest">
                  TOURNAMENT RESULTS SCOREBOARD
                </span>
                <h2 className="font-display text-4xl sm:text-6xl text-amber-400 font-black mt-3">
                  MATCH RESULTS & PODIUM STANDINGS
                </h2>
                <p className="text-slate-300 font-medium text-base mt-2">
                  Complete official record of every match, winner team, defeated team, and points
                </p>
              </div>

              {/* Official Podium Standings if Available */}
              <TournamentPodium tournament={tournament} matches={matches} />

              {finishedMatches.length > 0 ? (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {finishedMatches.map((m) => (
                    <MatchResultCard key={m._id} match={m} totalRounds={tournament.rounds} isDark={true} />
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border-2 border-slate-800 bg-slate-950 py-16 text-center">
                  <p className="text-3xl font-display font-black text-white">No matches finished yet</p>
                  <p className="text-base text-slate-400 mt-2 font-medium">
                    Results will appear here with points as soon as a match ends
                  </p>
                </div>
              )}

              {/* Player Awards Showcase */}
              <PlayerAwardsBanner tournament={tournament} />
            </div>
          )}

          {/* Mode: Grand Closing Ceremony & Award Presentation (Zero-Scroll Olympic Stage) */}
          {mode === 'ceremony' && (
            <div className="py-1 text-center max-w-6xl mx-auto space-y-3">
              <div>
                <span className="rounded-full bg-amber-400 text-slate-950 px-4 py-0.5 text-[11px] font-black uppercase tracking-widest shadow-xl">
                  🎉 GRAND CLOSING & AWARD PRESENTATION CEREMONY
                </span>
                <h2 className="font-display text-2xl sm:text-4xl text-amber-400 font-black mt-1 tracking-wide">
                  {tournament.name} {tournament.year}
                </h2>
                <p className="text-slate-300 font-bold text-xs sm:text-sm">Official Award Distribution & Honors</p>
              </div>

              {/* Official 3-Step Tournament Podium (1st, 2nd, 3rd) */}
              <TournamentPodium tournament={tournament} matches={matches} />

              {/* Player Awards Reveal */}
              <PlayerAwardsBanner tournament={tournament} />
            </div>
          )}

          {/* Mode 3: Welcome, Organizer & Prize Money Stage */}
          {mode === 'welcome' && (
            <div className="py-4 space-y-8">
              <div className="text-center mb-8">
                <span className="rounded-full bg-amber-400 text-slate-950 px-4 py-1 text-xs font-black uppercase tracking-widest shadow-md">
                  VILLAGE KABADDI CHAMPIONSHIP
                </span>
                <h2 className="font-display text-4xl sm:text-7xl text-amber-400 font-black tracking-wide mt-2">
                  {tournament.name}
                </h2>
                <p className="mt-2 text-xl text-slate-300 font-bold">{tournament.year} • Grand Kabaddi Mahakumbh</p>
              </div>

              {/* Official Tournament Podium if Champion exists */}
              <TournamentPodium tournament={tournament} matches={matches} />

              {/* Prize Money Highlight */}
              {cfg.showPrizeMoney && (tournament.prizeMoney?.winner > 0 || tournament.prizeMoney?.runnerUp > 0 || tournament.prizeMoney?.thirdPlace > 0) && (
                <div className="grid gap-4 sm:grid-cols-3 max-w-5xl mx-auto">
                  {tournament.prizeMoney.winner > 0 && (
                    <div className="rounded-3xl border-3 border-amber-400 bg-gradient-to-b from-amber-950/80 to-slate-950 p-6 text-center shadow-2xl">
                      <div className="inline-block rounded-full bg-amber-400 text-slate-950 px-3.5 py-1 text-xs font-black tracking-widest uppercase shadow-md">
                        🥇 1st Prize / Champion
                      </div>
                      <div className="my-2.5 font-display text-4xl sm:text-6xl font-black text-amber-300 tabular-nums">
                        ₹{tournament.prizeMoney.winner.toLocaleString('en-IN')}
                      </div>
                      <div className="text-xs font-bold text-slate-300">Trophy + Champion Cash Prize</div>
                    </div>
                  )}
                  {tournament.prizeMoney.runnerUp > 0 && (
                    <div className="rounded-3xl border-2 border-slate-500 bg-slate-900 p-6 text-center shadow-xl">
                      <div className="inline-block rounded-full bg-slate-200 text-slate-900 px-3.5 py-1 text-xs font-black tracking-widest uppercase shadow-md">
                        🥈 2nd Prize / Runner-Up
                      </div>
                      <div className="my-2.5 font-display text-4xl sm:text-6xl font-black text-white tabular-nums">
                        ₹{tournament.prizeMoney.runnerUp.toLocaleString('en-IN')}
                      </div>
                      <div className="text-xs font-bold text-slate-300">Runner-up Trophy</div>
                    </div>
                  )}
                  {tournament.prizeMoney.thirdPlace > 0 && (
                    <div className="rounded-3xl border-2 border-amber-600/70 bg-gradient-to-b from-amber-950/40 to-slate-950 p-6 text-center shadow-xl col-span-2 sm:col-span-1">
                      <div className="inline-block rounded-full bg-amber-600 text-white px-3.5 py-1 text-xs font-black tracking-widest uppercase shadow-md">
                        🥉 3rd Prize / 3rd Place
                      </div>
                      <div className="my-2.5 font-display text-4xl sm:text-6xl font-black text-amber-400 tabular-nums">
                        ₹{tournament.prizeMoney.thirdPlace.toLocaleString('en-IN')}
                      </div>
                      <div className="text-xs font-bold text-slate-300">Semi-Final Playoff Winner</div>
                    </div>
                  )}
                </div>
              )}

              {/* Individual Player Honors: Best Raider & Best Defender */}
              <div className="max-w-5xl mx-auto">
                <PlayerAwardsBanner tournament={tournament} />
              </div>

              {/* Organizer & Important Guests */}
              <div className="grid gap-6 sm:grid-cols-2 max-w-4xl mx-auto">
                {cfg.showOrganizer && tournament.organizer?.name && (
                  <div className="rounded-2xl border-2 border-amber-500/40 bg-slate-900 p-6 shadow-lg">
                    <span className="rounded bg-amber-400 text-slate-950 px-2 py-0.5 text-xs font-black uppercase tracking-wider">
                      Chief Organizer
                    </span>
                    <h3 className="font-display text-2xl sm:text-3xl font-black text-white mt-2">{tournament.organizer.name}</h3>
                    {tournament.organizer.village && <p className="text-slate-300 text-sm font-medium mt-1">📍 {tournament.organizer.village}</p>}
                    {tournament.organizer.phone && <p className="text-amber-300 text-sm font-bold mt-1">📞 {tournament.organizer.phone}</p>}
                  </div>
                )}

                {cfg.showMembers && tournament.members?.length > 0 && (
                  <div className="rounded-2xl border-2 border-slate-700 bg-slate-900 p-6 shadow-lg">
                    <span className="rounded bg-slate-200 text-slate-950 px-2 py-0.5 text-xs font-black uppercase tracking-wider">
                      Dignitaries & Committee
                    </span>
                    <div className="mt-3 space-y-2.5">
                      {tournament.members.slice(0, 4).map((m, i) => (
                        <div key={i} className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
                          <span className="font-bold text-white text-base">{m.name}</span>
                          <span className="text-amber-400 font-semibold">{m.role}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mode 4: Teams Showcase */}
          {mode === 'teams' && (
            <div>
              <div className="mb-6 text-center">
                <span className="rounded-full bg-amber-400 text-slate-950 px-4 py-1 text-xs font-black uppercase tracking-widest shadow-md">
                  TEAM ROSTER & SQUADS
                </span>
                <h2 className="font-display text-3xl sm:text-5xl text-amber-400 font-black mt-2">
                  PARTICIPATING TEAMS
                </h2>
                <p className="text-slate-300 font-medium">Kabaddi Warriors on the mat</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {teams.map((t) => (
                  <div key={t._id} className="rounded-2xl border-2 border-slate-800 bg-slate-900 p-5 text-center shadow-xl hover:border-amber-400/50 transition">
                    <div className="mx-auto mb-3 flex justify-center">
                      <Avatar src={t.logo} name={t.name} size="lg" />
                    </div>
                    <div className="font-display text-2xl font-black text-white truncate">{t.name}</div>
                    <div className="text-xs font-bold text-amber-400 mt-1">{t.village || 'Kabaddi Team'}</div>
                    {t.captain && (
                      <div className="mt-3 inline-block rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 px-3 py-0.5 text-xs font-black">
                        Captain: {t.captain.name}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mode 5: Big Announcement Card */}
          {mode === 'announcement' && (
            <div className="py-16 text-center max-w-3xl mx-auto">
              <span className="rounded-full bg-amber-400 text-slate-950 px-5 py-1.5 text-xs font-black uppercase tracking-widest shadow-xl">
                📢 TOURNAMENT ANNOUNCEMENT
              </span>
              <h2 className="mt-8 font-display text-4xl sm:text-6xl leading-tight font-black text-white">
                {cfg.announcement || 'Welcome to the tournament! Stay tuned for updates.'}
              </h2>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Live Ticker */}
      {cfg.showTicker && cfg.announcement && (
        <footer className="border-t-2 border-amber-500 bg-amber-400 px-4 py-3 text-slate-950 shadow-2xl">
          <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
            <span className="rounded bg-slate-950 px-2.5 py-1 text-xs font-black uppercase tracking-wider text-white shadow-md">
              📢 NOTICE
            </span>
            <div className="anim-ticker inline-block font-black text-lg sm:text-xl text-slate-950">
              {cfg.announcement}
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
