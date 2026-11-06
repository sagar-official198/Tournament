import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/api.js';
import { useScorerKey } from '../../context/ScorerKeyContext.jsx';
import { useTournament } from '../../hooks/useTournament.js';
import { Loading, ErrorBox } from '../../components/Feedback.jsx';
import MatchResultCard from '../../components/MatchResultCard.jsx';
import { teamName } from '../../utils/rounds.js';

function StatCard({ label, value, color = 'bg-ink' }) {
  return (
    <div className={`${color} rounded-2xl p-4 text-white text-center shadow-md`}>
      <div className="font-display text-3xl font-black">{value}</div>
      <div className="text-xs font-bold uppercase tracking-wider opacity-90 mt-1">{label}</div>
    </div>
  );
}

export default function ManageDashboard() {
  const key = useScorerKey();
  const { tournament, matches, loading, error, reload } = useTournament();
  const [teams, setTeams] = useState([]);
  const [teamErr, setTeamErr] = useState('');

  // Screen & Broadcast control state
  const [activeScreen, setActiveScreen] = useState('auto');
  const [announcement, setAnnouncement] = useState('');
  const [showPrizeMoney, setShowPrizeMoney] = useState(true);
  const [showOrganizer, setShowOrganizer] = useState(true);
  const [showMembers, setShowMembers] = useState(true);
  const [showTicker, setShowTicker] = useState(true);
  const [featuredMatch, setFeaturedMatch] = useState('');
  const [displaySaving, setDisplaySaving] = useState(false);
  const [displayMsg, setDisplayMsg] = useState('');

  // Player Awards state
  const [bestRaiderName, setBestRaiderName] = useState('');
  const [bestRaiderTeam, setBestRaiderTeam] = useState('');
  const [bestRaiderPrize, setBestRaiderPrize] = useState('');
  const [bestDefenderName, setBestDefenderName] = useState('');
  const [bestDefenderTeam, setBestDefenderTeam] = useState('');
  const [bestDefenderPrize, setBestDefenderPrize] = useState('');
  const [awardsAnnounced, setAwardsAnnounced] = useState(true);
  const [awardsSaving, setAwardsSaving] = useState(false);
  const [awardsMsg, setAwardsMsg] = useState('');

  useEffect(() => {
    if (tournament) {
      if (tournament.awards) {
        setBestRaiderName(tournament.awards.bestRaider?.playerName || '');
        setBestRaiderTeam(tournament.awards.bestRaider?.teamName || '');
        setBestDefenderName(tournament.awards.bestDefender?.playerName || '');
        setBestDefenderTeam(tournament.awards.bestDefender?.teamName || '');
        setAwardsAnnounced(tournament.awards.isAnnounced !== false);
      }
      if (tournament.prizeMoney) {
        setBestRaiderPrize(tournament.prizeMoney.bestRaider || '');
        setBestDefenderPrize(tournament.prizeMoney.bestDefender || '');
      }
    }
  }, [tournament]);

  const saveAwards = async () => {
    if (!tournament) return;
    setAwardsSaving(true);
    setAwardsMsg('');
    try {
      const payload = {
        prizeMoney: {
          ...(tournament.prizeMoney || {}),
          bestRaider: Number(bestRaiderPrize) || 0,
          bestDefender: Number(bestDefenderPrize) || 0,
        },
        awards: {
          isAnnounced: Boolean(awardsAnnounced),
          bestRaider: { playerName: bestRaiderName.trim(), teamName: bestRaiderTeam.trim() },
          bestDefender: { playerName: bestDefenderName.trim(), teamName: bestDefenderTeam.trim() },
        },
      };
      await api.put(`/tournaments/${tournament._id}`, payload, key);
      setAwardsMsg('Best Raider & Defender awards saved! ✓');
      setTimeout(() => setAwardsMsg(''), 4000);
      if (reload) reload();
    } catch (e) {
      setAwardsMsg(e.message);
    } finally {
      setAwardsSaving(false);
    }
  };

  const toggleRevealAwards = async () => {
    if (!tournament) return;
    setAwardsSaving(true);
    setAwardsMsg('');
    try {
      const nextAnnounced = !awardsAnnounced;
      setAwardsAnnounced(nextAnnounced);
      const payload = {
        prizeMoney: {
          ...(tournament.prizeMoney || {}),
          bestRaider: Number(bestRaiderPrize) || 0,
          bestDefender: Number(bestDefenderPrize) || 0,
        },
        awards: {
          isAnnounced: nextAnnounced,
          bestRaider: { playerName: bestRaiderName.trim(), teamName: bestRaiderTeam.trim() },
          bestDefender: { playerName: bestDefenderName.trim(), teamName: bestDefenderTeam.trim() },
        },
      };
      await api.put(`/tournaments/${tournament._id}`, payload, key);
      setAwardsMsg(nextAnnounced ? '🎉 Player Awards REVEALED on screen!' : '🔒 Player Awards HIDDEN from screen!');
      setTimeout(() => setAwardsMsg(''), 4000);
      if (reload) reload();
    } catch (e) {
      setAwardsMsg(e.message);
    } finally {
      setAwardsSaving(false);
    }
  };

  useEffect(() => {
    if (tournament?.displayConfig) {
      const d = tournament.displayConfig;
      if (d.activeScreen) setActiveScreen(d.activeScreen);
      if (d.announcement !== undefined) setAnnouncement(d.announcement);
      if (d.showPrizeMoney !== undefined) setShowPrizeMoney(d.showPrizeMoney);
      if (d.showOrganizer !== undefined) setShowOrganizer(d.showOrganizer);
      if (d.showMembers !== undefined) setShowMembers(d.showMembers);
      if (d.showTicker !== undefined) setShowTicker(d.showTicker);
      if (d.featuredMatch) setFeaturedMatch(d.featuredMatch);
    }
  }, [tournament]);

  useEffect(() => {
    api.get('/teams').then(setTeams).catch((e) => setTeamErr(e.message));
  }, []);

  const updateScreenConfig = async (overrides = {}) => {
    if (!tournament) return;
    setDisplaySaving(true);
    setDisplayMsg('');
    const payload = {
      activeScreen,
      announcement,
      showPrizeMoney,
      showOrganizer,
      showMembers,
      showTicker,
      featuredMatch: featuredMatch || null,
      ...overrides,
    };
    try {
      await api.put(`/tournaments/${tournament._id}/display`, payload, key);
      setDisplayMsg('Broadcast screen updated live! 🚀');
      setTimeout(() => setDisplayMsg(''), 4000);
      if (reload) reload();
    } catch (err) {
      setDisplayMsg(err.message);
    } finally {
      setDisplaySaving(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorBox message={error} />;

  const real = matches.filter((m) => !m.bye);
  const live = real.filter((m) => m.status === 'live');
  const finished = real.filter((m) => m.status === 'finished');
  const upcoming = real.filter((m) => m.status === 'upcoming');

  const base = `/manage/${key}`;

  const screenOptions = [
    { id: 'auto', label: '🔄 Auto Mode', desc: 'Live match if live, else bracket', color: 'border-cyan-500' },
    { id: 'live_match', label: '🔴 Live Score', desc: 'Real-time scoreboard & timer', color: 'border-red-500' },
    { id: 'results', label: '📊 Match Results', desc: 'Winners, losers & scores', color: 'border-emerald-500' },
    { id: 'bracket', label: '🏆 Knockout', desc: 'Tournament bracket tree', color: 'border-amber-500' },
    { id: 'ceremony', label: '🎉 Closing Ceremony', desc: 'Grand awards & honors reveal', color: 'border-purple-500' },
    { id: 'welcome', label: '💰 Prize & Org', desc: 'Welcome, prizes, organizer', color: 'border-blue-500' },
    { id: 'teams', label: '👥 Teams', desc: 'Team squads & logos', color: 'border-teal-500' },
    { id: 'announcement', label: '📢 Notice', desc: 'Fullscreen announcement', color: 'border-rose-500' },
  ];

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-black text-slate-900">Admin Control Center</h1>
          <p className="text-sm text-slate-500 mt-0.5">Control live scores, arena displays, and tournament flow in real time</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/screen"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-amber-400 text-slate-950 font-black text-sm px-4 py-2 hover:bg-amber-300 transition shadow-md flex items-center gap-1.5"
          >
            🖥️ Open Big Arena Screen (/screen) ↗
          </a>
        </div>
      </div>

      <ErrorBox message={teamErr} />

      {/* TOP PRODUCTION CONTROLLER: ARENA & BIG SCREEN */}
      {tournament && (
        <section className="mb-8 rounded-3xl border-3 border-amber-400 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 text-white shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-amber-400 text-slate-950 px-2 py-0.5 text-xs font-black uppercase tracking-wider">
                  MASTER BROADCAST
                </span>
                <h2 className="font-display text-2xl font-black text-white">
                  📺 ARENA SCREEN CONTROLLER (बड़ी स्क्रीन नियंत्रण)
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Admin controls what is displayed on big arena screens & projectors in real-time via WebSockets.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {displayMsg && (
                <span className="text-xs font-black text-emerald-400 bg-emerald-950/80 border border-emerald-500/50 px-3 py-1.5 rounded-full shadow anim-bump">
                  {displayMsg}
                </span>
              )}
              <div className="flex items-center gap-2 rounded-full bg-slate-800/80 border border-slate-700 px-3 py-1 text-xs font-black">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 anim-blink"></span>
                <span>Active Broadcast:</span>
                <span className="text-amber-400 uppercase font-black">
                  {screenOptions.find((s) => s.id === activeScreen)?.label || activeScreen}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Screen Selectors */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-400">
                1-Click Screen Broadcast Selection:
              </label>
              <span className="text-xs text-slate-400">Changes reflect instantly on /screen</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-8">
              {screenOptions.map((btn) => {
                const isSelected = activeScreen === btn.id;
                return (
                  <button
                    key={btn.id}
                    type="button"
                    disabled={displaySaving}
                    onClick={() => {
                      setActiveScreen(btn.id);
                      updateScreenConfig({ activeScreen: btn.id });
                    }}
                    className={`rounded-2xl p-3 text-left border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-400 bg-amber-400 text-slate-950 shadow-xl scale-102 ring-2 ring-amber-300'
                        : 'border-slate-800 bg-slate-900/90 text-white hover:border-slate-600 hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-display text-sm font-black tracking-wide leading-tight">{btn.label}</div>
                    <div className={`text-[11px] mt-1.5 line-clamp-1 font-medium ${isSelected ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                      {btn.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Focus Specific Match */}
          {real.length > 0 && (
            <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <label className="text-xs font-black uppercase tracking-wider text-amber-300 whitespace-nowrap">
                  🎯 Focus Specific Match on Scoreboard:
                </label>
                <select
                  className="rounded-xl border border-slate-700 bg-slate-900 text-white text-sm py-1.5 px-3 focus:outline-none focus:border-amber-400"
                  value={featuredMatch}
                  onChange={(e) => {
                    const val = e.target.value || null;
                    setFeaturedMatch(val || '');
                    updateScreenConfig({ featuredMatch: val, activeScreen: 'live_match' });
                    setActiveScreen('live_match');
                  }}
                >
                  <option value="">Auto-Detect (Current Live or Latest Match)</option>
                  {real.map((m) => (
                    <option key={m._id} value={m._id}>
                      R{m.round}M{m.matchNumber}: {teamName(m.teamA)} vs {teamName(m.teamB)} ({m.status.toUpperCase()} {m.scoreA}-{m.scoreB})
                    </option>
                  ))}
                </select>
              </div>

              {live.length > 0 && (
                <Link
                  to={`${base}/score/${live[0]._id}`}
                  className="rounded-xl bg-red-600 text-white font-black text-xs px-4 py-2 hover:bg-red-500 transition shadow flex items-center gap-1.5"
                >
                  <span className="h-2 w-2 rounded-full bg-white anim-blink"></span>
                  🔴 Open Live Match Scorer Panel ({teamName(live[0].teamA)} vs {teamName(live[0].teamB)}) →
                </Link>
              )}
            </div>
          )}

          {/* Live Announcement / Ticker Notice */}
          <div className="mt-4 pt-4 border-t border-slate-800">
            <label className="text-xs font-black uppercase tracking-wider text-slate-400">
              📢 Live Announcement Ticker Notice (स्क्रीन पर चलने वाली पट्टी)
            </label>
            <div className="mt-2 flex gap-2">
              <input
                className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                placeholder="e.g. Next match: Karbala vs Team 4 at 4:30 PM | Welcome Chief Guest!"
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                maxLength={200}
              />
              <button
                type="button"
                disabled={displaySaving}
                onClick={() => updateScreenConfig()}
                className="rounded-xl bg-amber-400 text-slate-950 font-black text-sm px-5 py-2 hover:bg-amber-300 transition shadow"
              >
                Broadcast Notice
              </button>
              {announcement && (
                <button
                  type="button"
                  onClick={() => {
                    setAnnouncement('');
                    updateScreenConfig({ announcement: '' });
                  }}
                  className="rounded-xl bg-slate-800 text-slate-300 text-sm px-3 hover:bg-slate-700 transition"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Display Feature Toggles */}
          <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap gap-5 text-xs font-bold text-slate-300">
            <label className="flex items-center gap-2 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={showPrizeMoney}
                onChange={(e) => {
                  setShowPrizeMoney(e.target.checked);
                  updateScreenConfig({ showPrizeMoney: e.target.checked });
                }}
                className="h-4 w-4 accent-amber-400"
              />
              Show Prize Money
            </label>

            <label className="flex items-center gap-2 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={showOrganizer}
                onChange={(e) => {
                  setShowOrganizer(e.target.checked);
                  updateScreenConfig({ showOrganizer: e.target.checked });
                }}
                className="h-4 w-4 accent-amber-400"
              />
              Show Organizer Details
            </label>

            <label className="flex items-center gap-2 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={showMembers}
                onChange={(e) => {
                  setShowMembers(e.target.checked);
                  updateScreenConfig({ showMembers: e.target.checked });
                }}
                className="h-4 w-4 accent-amber-400"
              />
              Show Committee Members
            </label>

            <label className="flex items-center gap-2 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={showTicker}
                onChange={(e) => {
                  setShowTicker(e.target.checked);
                  updateScreenConfig({ showTicker: e.target.checked });
                }}
                className="h-4 w-4 accent-amber-400"
              />
              Show Ticker Bar
            </label>
          </div>
        </section>
      )}

      {/* Tournament Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
        <StatCard label="Total Teams" value={teams.length} color="bg-slate-900" />
        <StatCard label="Matches Played" value={finished.length} color="bg-emerald-700" />
        <StatCard label="Live Matches" value={live.length} color={live.length > 0 ? 'bg-red-600 anim-blink' : 'bg-slate-800'} />
        <StatCard label="Upcoming Matches" value={upcoming.length} color="bg-amber-600" />
      </div>

      {/* Tournament Info Panel */}
      {tournament ? (
        <div className="panel mb-6 border-2 border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-black text-slate-900">
                {tournament.name} {tournament.year}
              </h2>
              <span className={`inline-block mt-1 rounded-full px-3 py-0.5 text-xs font-black text-white ${
                tournament.status === 'ongoing' ? 'bg-emerald-600' : tournament.status === 'completed' ? 'bg-amber-500 text-slate-950' : 'bg-slate-600'
              }`}>
                {tournament.status.toUpperCase()}
              </span>
            </div>
            {tournament.status === 'completed' && tournament.champion && (
              <div className="rounded-2xl bg-amber-400 px-5 py-2.5 text-center text-slate-950 shadow-md">
                <div className="text-xs font-black uppercase tracking-wider">🏆 Tournament Champion</div>
                <div className="font-display text-xl font-black">{tournament.champion.name}</div>
              </div>
            )}
          </div>

          {/* Tournament Podium / Final Standings (1st, 2nd, 3rd) */}
          {(tournament.champion || tournament.runnerUp || tournament.thirdPlaceTeam || tournament.status === 'completed') && (
            <div className="mt-4 rounded-2xl bg-gradient-to-r from-amber-50 via-slate-50 to-amber-50 p-4 border-2 border-amber-300 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-amber-900 bg-amber-200 px-3 py-1 rounded-full">
                  🏆 Tournament Final Standings (पोडियम - अंतिम परिणाम)
                </span>
                {tournament.status === 'completed' && (
                  <span className="text-xs font-black text-emerald-700 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                    ✓ TOURNAMENT COMPLETED
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center items-end">
                {/* 2nd Place Runner-Up (Order 2 on mobile, Order 1 on sm) */}
                <div className="order-2 sm:order-1 rounded-xl bg-slate-100 p-3 text-slate-900 shadow-md border-2 border-slate-300 anim-silver-podium shine-sweep">
                  <div className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center justify-center gap-1">
                    <span className="anim-medal-bob">🥈</span> 2nd Place • Runner-Up
                  </div>
                  <div className="font-display text-xl font-black mt-1 text-slate-900">
                    {tournament.runnerUp?.name || 'In Progress'}
                  </div>
                  {tournament.prizeMoney?.runnerUp > 0 && (
                    <div className="text-xs font-black text-slate-700 mt-1 pt-1 border-t border-slate-200">₹{tournament.prizeMoney.runnerUp.toLocaleString('en-IN')}</div>
                  )}
                </div>

                {/* 1st Place Champion (Order 1 on mobile, Order 2 on sm) */}
                <div className="order-1 sm:order-2 rounded-xl bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 p-3.5 text-slate-950 shadow-xl border-2 border-amber-500 anim-gold-podium anim-champion-float shine-sweep relative sm:-translate-y-1">
                  <div className="text-[11px] font-black uppercase tracking-wider text-slate-950 flex items-center justify-center gap-1">
                    <span className="anim-trophy">🏆</span> 🥇 1st Place • Champion
                  </div>
                  <div className="font-display text-2xl font-black mt-1 text-slate-950">
                    {tournament.champion?.name || 'In Progress'}
                  </div>
                  {tournament.prizeMoney?.winner > 0 && (
                    <div className="text-xs font-black text-slate-950 mt-1 pt-1 border-t border-amber-500/60 font-mono">₹{tournament.prizeMoney.winner.toLocaleString('en-IN')}</div>
                  )}
                </div>

                {/* 3rd Place Playoff Winner (Order 3) */}
                <div className="order-3 rounded-xl bg-amber-50 p-3 text-amber-950 shadow-md border-2 border-amber-400 anim-bronze-podium shine-sweep">
                  <div className="text-[11px] font-black uppercase tracking-wider text-amber-800 flex items-center justify-center gap-1">
                    <span className="anim-medal-bob">🥉</span> 3rd Place • Playoff Winner
                  </div>
                  <div className="font-display text-xl font-black mt-1 text-amber-950">
                    {tournament.thirdPlaceTeam?.name || '3rd Place Match Pending'}
                  </div>
                  {tournament.prizeMoney?.thirdPlace > 0 && (
                    <div className="text-xs font-black text-amber-900 mt-1 pt-1 border-t border-amber-200">₹{tournament.prizeMoney.thirdPlace.toLocaleString('en-IN')}</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Organizer info */}
          {tournament.organizer?.name && (
            <div className="mt-4 rounded-xl bg-slate-50 p-3.5 border border-slate-200">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-1">Chief Organizer</h3>
              <p className="font-bold text-slate-900 text-base">{tournament.organizer.name}</p>
              {tournament.organizer.village && <p className="text-sm text-slate-600">📍 {tournament.organizer.village}</p>}
              {tournament.organizer.phone && <p className="text-sm text-slate-600 font-bold">📞 {tournament.organizer.phone}</p>}
            </div>
          )}

          {/* Prize money */}
          {(tournament.prizeMoney?.winner > 0 || tournament.prizeMoney?.runnerUp > 0 || tournament.prizeMoney?.thirdPlace > 0) && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">🏆 Official Prize Pool</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {tournament.prizeMoney.winner > 0 && (
                  <div className="rounded-xl bg-emerald-50 p-3 text-center border-2 border-emerald-400 shadow-sm">
                    <div className="text-xs font-black text-emerald-800 uppercase tracking-wide">🥇 1st Prize</div>
                    <div className="font-display text-2xl font-black text-emerald-700 mt-0.5">₹{tournament.prizeMoney.winner.toLocaleString('en-IN')}</div>
                  </div>
                )}
                {tournament.prizeMoney.runnerUp > 0 && (
                  <div className="rounded-xl bg-slate-100 p-3 text-center border-2 border-slate-300 shadow-sm">
                    <div className="text-xs font-black text-slate-700 uppercase tracking-wide">🥈 2nd Prize</div>
                    <div className="font-display text-2xl font-black text-slate-900 mt-0.5">₹{tournament.prizeMoney.runnerUp.toLocaleString('en-IN')}</div>
                  </div>
                )}
                {tournament.prizeMoney.thirdPlace > 0 && (
                  <div className="rounded-xl bg-amber-50 p-3 text-center border-2 border-amber-400 shadow-sm col-span-2 sm:col-span-1">
                    <div className="text-xs font-black text-amber-800 uppercase tracking-wide">🥉 3rd Prize</div>
                    <div className="font-display text-2xl font-black text-amber-700 mt-0.5">₹{tournament.prizeMoney.thirdPlace.toLocaleString('en-IN')}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Interactive Player Awards Entry & Screen Broadcast Card */}
          <div className="mt-5 pt-4 border-t-2 border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div>
                <span className="rounded bg-amber-400 text-slate-950 px-2 py-0.5 text-xs font-black uppercase tracking-wider">
                  ⭐ PLAYER AWARDS (खिलाड़ी पुरस्कार)
                </span>
                <h3 className="font-display text-xl font-black text-slate-900 mt-1">
                  Enter Best Raider & Best Defender (स्क्रीन पर नाम दिखाएं)
                </h3>
              </div>
              {awardsMsg && (
                <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-400 px-3 py-1 text-xs font-black shadow-sm anim-bump">
                  {awardsMsg}
                </span>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Best Raider Input */}
              <div className="rounded-2xl border-2 border-blue-400 bg-blue-50/60 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="rounded bg-blue-600 text-white px-2.5 py-0.5 text-xs font-black uppercase tracking-wider">
                    ⚡ Best Raider (सर्वश्रेष्ठ रेडर)
                  </span>
                  <span className="text-xs font-bold text-blue-800">
                    {bestRaiderName ? `Current: ${bestRaiderName}` : 'Not set'}
                  </span>
                </div>
                <div className="space-y-2 mt-2">
                  <div>
                    <label className="text-[11px] font-black uppercase text-slate-600">Player Name (खिलाड़ी का नाम):</label>
                    <input
                      className="field mt-0.5 text-sm bg-white border-2 border-blue-300 font-bold"
                      placeholder="e.g. Rahul Kumar"
                      value={bestRaiderName}
                      onChange={(e) => setBestRaiderName(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-black uppercase text-slate-600">Team (टीम):</label>
                      <input
                        className="field mt-0.5 text-sm bg-white"
                        placeholder="e.g. Team 4"
                        value={bestRaiderTeam}
                        onChange={(e) => setBestRaiderTeam(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-black uppercase text-slate-600">Cash Prize (₹):</label>
                      <input
                        className="field mt-0.5 text-sm bg-white font-bold"
                        type="number"
                        placeholder="5100"
                        value={bestRaiderPrize}
                        onChange={(e) => setBestRaiderPrize(e.target.value)}
                        min={0}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Best Defender Input */}
              <div className="rounded-2xl border-2 border-purple-400 bg-purple-50/60 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="rounded bg-purple-600 text-white px-2.5 py-0.5 text-xs font-black uppercase tracking-wider">
                    🛡️ Best Defender (सर्वश्रेष्ठ डिफेंडर)
                  </span>
                  <span className="text-xs font-bold text-purple-800">
                    {bestDefenderName ? `Current: ${bestDefenderName}` : 'Not set'}
                  </span>
                </div>
                <div className="space-y-2 mt-2">
                  <div>
                    <label className="text-[11px] font-black uppercase text-slate-600">Player Name (खिलाड़ी का नाम):</label>
                    <input
                      className="field mt-0.5 text-sm bg-white border-2 border-purple-300 font-bold"
                      placeholder="e.g. Shir"
                      value={bestDefenderName}
                      onChange={(e) => setBestDefenderName(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-black uppercase text-slate-600">Team (टीम):</label>
                      <input
                        className="field mt-0.5 text-sm bg-white"
                        placeholder="e.g. Team 5"
                        value={bestDefenderTeam}
                        onChange={(e) => setBestDefenderTeam(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-black uppercase text-slate-600">Cash Prize (₹):</label>
                      <input
                        className="field mt-0.5 text-sm bg-white font-bold"
                        type="number"
                        placeholder="5100"
                        value={bestDefenderPrize}
                        onChange={(e) => setBestDefenderPrize(e.target.value)}
                        min={0}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Save & Reveal Bar */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-100 border-2 border-slate-300">
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  awardsAnnounced ? 'bg-emerald-100 text-emerald-800 border border-emerald-400' : 'bg-amber-100 text-amber-800 border border-amber-400'
                }`}>
                  {awardsAnnounced ? '🟢 Public on Screen' : '🔒 Hidden on Screen'}
                </span>
                <span className="text-xs text-slate-600 font-bold">
                  {awardsAnnounced
                    ? 'खिलाड़ियों के नाम स्क्रीन पर लाइव दिख रहे हैं।'
                    : 'नाम अभी लॉक हैं। क्लोजिंग सेरेमनी / मुख्य अतिथि के आने पर "REVEAL" दबाएं।'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={awardsSaving}
                  onClick={toggleRevealAwards}
                  className={`rounded-xl px-4 py-2.5 text-xs font-black text-white transition shadow flex items-center gap-1.5 ${
                    awardsAnnounced
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-emerald-600 hover:bg-emerald-700 font-black'
                  }`}
                >
                  {awardsAnnounced ? '🔒 Hide Names from Screen' : '📢 REVEAL NAMES ON SCREEN NOW (स्क्रीन पर नाम दिखाएं)'}
                </button>

                <button
                  type="button"
                  disabled={awardsSaving}
                  onClick={saveAwards}
                  className="rounded-xl bg-slate-950 text-white font-black text-xs px-5 py-2.5 hover:bg-slate-800 transition shadow flex items-center gap-1.5"
                >
                  💾 Save Details (सेव करें)
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="panel mb-6 text-center py-8">
          <p className="text-slate-500 mb-3">No tournament created yet</p>
          <Link to={`${base}/tournament`} className="btn-dark">Create Tournament</Link>
        </div>
      )}

      {/* Live matches */}
      {live.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-3 text-2xl font-display font-black text-slate-900 flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-600 anim-blink"></span>
            🔴 Ongoing Live Matches ({live.length})
          </h2>
          <div className="grid gap-3">
            {live.map((m) => (
              <div key={m._id} className="panel border-2 border-red-500 bg-red-50/20 shadow-md">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="font-display text-xl font-black">{teamName(m.teamA)}</span>
                    <span className="font-display text-3xl font-black mx-3 text-blue-600">{m.scoreA}</span>
                    <span className="text-slate-400 font-bold">-</span>
                    <span className="font-display text-3xl font-black mx-3 text-orange-600">{m.scoreB}</span>
                    <span className="font-display text-xl font-black">{teamName(m.teamB)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFeaturedMatch(m._id);
                        setActiveScreen('live_match');
                        updateScreenConfig({ featuredMatch: m._id, activeScreen: 'live_match' });
                      }}
                      className="rounded-lg bg-slate-900 text-white font-bold text-xs px-3 py-2 hover:bg-slate-800 transition"
                    >
                      📺 Broadcast on Big Screen
                    </button>
                    <Link to={`${base}/score/${m._id}`} className="btn-danger text-sm px-4 py-2">
                      Score Match →
                    </Link>
                  </div>
                </div>
                {m.timer && (
                  <p className="text-xs font-bold text-slate-600 mt-2">
                    Half {m.timer.half} • {m.timer.isPaused ? '⏸ Timer Paused' : '▶ Timer Running'}
                    {m.timer.halfTimeScoreA !== null && ` • HT: ${m.timer.halfTimeScoreA}-${m.timer.halfTimeScoreB}`}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Completed Match Results & Scores */}
      {finished.length > 0 && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-2xl font-display font-black text-slate-900">
              🏆 Completed Match Results ({finished.length})
            </h2>
            <Link to={`${base}/matches`} className="text-sm font-bold text-slate-700 underline">
              View All Matches →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {finished.slice().reverse().map((m) => (
              <MatchResultCard key={m._id} match={m} totalRounds={tournament?.rounds} />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming matches */}
      {upcoming.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-3 text-2xl font-display font-black text-slate-900">
            📅 Upcoming Matches ({upcoming.length})
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {upcoming.slice(0, 4).map((m) => (
              <div key={m._id} className="panel border border-slate-200">
                <div className="flex items-center justify-between">
                  <p className="font-black text-slate-900 text-base">{teamName(m.teamA)} vs {teamName(m.teamB)}</p>
                  <span className="rounded bg-amber-100 text-amber-900 text-xs px-2 py-0.5 font-bold">R{m.round} M{m.matchNumber}</span>
                </div>
                {m.scheduledAt && <p className="text-xs text-slate-500 mt-1">🕒 {new Date(m.scheduledAt).toLocaleString('en-IN')}</p>}
                {m.ground && <p className="text-xs text-slate-500 mt-0.5">📍 {m.ground}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quick links */}
      <section className="panel border border-slate-200">
        <h2 className="mb-3 text-xl font-display font-black text-slate-900">Admin Shortcuts</h2>
        <div className="flex flex-wrap gap-3">
          <Link to={`${base}/matches`} className="btn-dark font-bold text-sm">📋 Start & Manage Matches</Link>
          <Link to={`${base}/teams`} className="btn-light font-bold text-sm">➕ Manage Teams & Players</Link>
          <Link to={`${base}/tournament`} className="btn-light font-bold text-sm">🏆 Edit Tournament / Prizes</Link>
          <a href="/screen" target="_blank" rel="noopener noreferrer" className="btn-light font-bold text-sm">🖥️ Big Arena Screen ↗</a>
          <Link to="/" className="btn-light font-bold text-sm">🌐 Public Website ↗</Link>
        </div>
      </section>
    </>
  );
}
