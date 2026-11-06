import { Link } from 'react-router-dom';
import { useTournament } from '../hooks/useTournament.js';
import MatchCard from '../components/MatchCard.jsx';
import MatchResultCard from '../components/MatchResultCard.jsx';
import { Loading, ErrorBox, Empty } from '../components/Feedback.jsx';

function Group({ title, matches, totalRounds }) {
  if (!matches.length) return null;
  return (
    <section className="mt-8">
      <h2 className="mb-3 text-2xl">{title}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {matches.map((m) => <MatchCard key={m._id} match={m} totalRounds={totalRounds} />)}
      </div>
    </section>
  );
}

export default function Home() {
  const { tournament, matches, loading, error } = useTournament();

  if (loading) return <Loading />;
  if (error) return <ErrorBox message={error} />;
  if (!tournament || !matches.length) {
    return <Empty title="The tournament has not started yet">Come back soon. Teams and the bracket will show up here.</Empty>;
  }

  const real = matches.filter((m) => !m.bye);
  const live = real.filter((m) => m.status === 'live');
  const upcoming = real
    .filter((m) => m.status === 'upcoming')
    .sort((a, b) => new Date(a.scheduledAt || '2999-01-01') - new Date(b.scheduledAt || '2999-01-01'))
    .slice(0, 4);
  const results = real.filter((m) => m.status === 'finished').reverse().slice(0, 4);
  const cfg = tournament.displayConfig || {};

  return (
    <>
      {/* Live Announcement / Notice from Admin */}
      {cfg.announcement && cfg.showTicker !== false && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl bg-amber-100 border-2 border-amber-500 p-4 text-amber-950 shadow-md">
          <span className="rounded-lg bg-amber-500 px-3 py-1 text-xs font-black text-slate-950 uppercase tracking-wider shadow-sm">
            📢 NOTICE
          </span>
          <p className="font-extrabold text-base sm:text-lg flex-1">{cfg.announcement}</p>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900">{tournament.name}</h1>
          <p className="text-slate-600 font-bold text-lg mt-0.5">{tournament.year} • Kabaddi Championship</p>
        </div>
        <Link
          to="/screen"
          target="_blank"
          className="rounded-xl border-2 border-slate-900 bg-slate-950 px-4 py-2.5 text-sm font-black text-white hover:bg-amber-400 hover:text-slate-950 hover:border-amber-400 transition-all shadow-md"
        >
          📺 Open Stadium Screen View ↗
        </Link>
      </div>

      {/* Organizer & Prize info */}
      {((cfg.showOrganizer !== false && tournament.organizer?.name) || (cfg.showPrizeMoney !== false && tournament.prizeMoney?.winner > 0)) && (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {cfg.showOrganizer !== false && tournament.organizer?.name && (
            <div className="panel border-2 border-slate-200 shadow-md">
              <span className="rounded bg-slate-900 text-white px-2 py-0.5 text-xs font-black uppercase tracking-wider">
                🎤 Chief Organizer
              </span>
              <p className="font-display text-2xl font-black text-slate-900 mt-2">{tournament.organizer.name}</p>
              {tournament.organizer.village && <p className="text-sm font-semibold text-slate-600 mt-0.5">📍 {tournament.organizer.village}</p>}
              {tournament.organizer.phone && <p className="text-sm font-bold text-blue-600 mt-0.5">📞 {tournament.organizer.phone}</p>}
            </div>
          )}
          {cfg.showPrizeMoney !== false && (tournament.prizeMoney?.winner > 0 || tournament.prizeMoney?.runnerUp > 0 || tournament.prizeMoney?.thirdPlace > 0) && (
            <div className="panel border-2 border-emerald-400 bg-emerald-50/50 shadow-md">
              <span className="rounded bg-emerald-600 text-white px-2 py-0.5 text-xs font-black uppercase tracking-wider">
                💰 Tournament Prize Money
              </span>
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-center">
                {tournament.prizeMoney?.winner > 0 && (
                  <div className="rounded-xl bg-white p-2.5 border-2 border-emerald-500 shadow-sm">
                    <span className="text-[10px] font-black text-emerald-800 uppercase">🥇 1st Prize</span>
                    <p className="font-display text-xl sm:text-2xl font-black text-emerald-700">₹{tournament.prizeMoney.winner.toLocaleString('en-IN')}</p>
                  </div>
                )}
                {tournament.prizeMoney?.runnerUp > 0 && (
                  <div className="rounded-xl bg-white p-2.5 border-2 border-slate-300 shadow-sm">
                    <span className="text-[10px] font-black text-slate-700 uppercase">🥈 2nd Prize</span>
                    <p className="font-display text-xl sm:text-2xl font-black text-slate-900">₹{tournament.prizeMoney.runnerUp.toLocaleString('en-IN')}</p>
                  </div>
                )}
                {tournament.prizeMoney?.thirdPlace > 0 && (
                  <div className="rounded-xl bg-white p-2.5 border-2 border-amber-400 shadow-sm col-span-2 sm:col-span-1">
                    <span className="text-[10px] font-black text-amber-800 uppercase">🥉 3rd Prize</span>
                    <p className="font-display text-xl sm:text-2xl font-black text-amber-700">₹{tournament.prizeMoney.thirdPlace.toLocaleString('en-IN')}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Special Player Awards */}
      {cfg.showPrizeMoney !== false && (tournament.prizeMoney?.bestRaider > 0 || tournament.prizeMoney?.bestDefender > 0 || tournament.awards?.bestRaider?.playerName || tournament.awards?.bestDefender?.playerName) && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {(tournament.prizeMoney?.bestRaider > 0 || tournament.awards?.bestRaider?.playerName) && (
            <div className="panel border-2 border-blue-400 bg-blue-50/50 shadow-md flex items-center justify-between">
              <div>
                <span className="rounded bg-blue-600 text-white px-2 py-0.5 text-xs font-black uppercase tracking-wider">
                  ⚡ Best Raider Award
                </span>
                <p className="font-display text-xl font-black text-slate-900 mt-1">
                  {tournament.awards?.isAnnounced && tournament.awards?.bestRaider?.playerName
                    ? tournament.awards.bestRaider.playerName
                    : '🔒 Announcement at the end of tournament'}
                </p>
                {tournament.awards?.isAnnounced && tournament.awards?.bestRaider?.teamName && (
                  <p className="text-xs font-semibold text-slate-600">Team: {tournament.awards.bestRaider.teamName}</p>
                )}
              </div>
              {tournament.prizeMoney?.bestRaider > 0 && (
                <div className="text-right">
                  <div className="text-[10px] font-black text-blue-700 uppercase">CASH PRIZE</div>
                  <div className="font-display text-2xl font-black text-blue-700">
                    ₹{tournament.prizeMoney.bestRaider.toLocaleString('en-IN')}
                  </div>
                </div>
              )}
            </div>
          )}

          {(tournament.prizeMoney?.bestDefender > 0 || tournament.awards?.bestDefender?.playerName) && (
            <div className="panel border-2 border-purple-400 bg-purple-50/50 shadow-md flex items-center justify-between">
              <div>
                <span className="rounded bg-purple-600 text-white px-2 py-0.5 text-xs font-black uppercase tracking-wider">
                  🛡️ Best Defender Award
                </span>
                <p className="font-display text-xl font-black text-slate-900 mt-1">
                  {tournament.awards?.isAnnounced && tournament.awards?.bestDefender?.playerName
                    ? tournament.awards.bestDefender.playerName
                    : '🔒 Announcement at the end of tournament'}
                </p>
                {tournament.awards?.isAnnounced && tournament.awards?.bestDefender?.teamName && (
                  <p className="text-xs font-semibold text-slate-600">Team: {tournament.awards.bestDefender.teamName}</p>
                )}
              </div>
              {tournament.prizeMoney?.bestDefender > 0 && (
                <div className="text-right">
                  <div className="text-[10px] font-black text-purple-700 uppercase">CASH PRIZE</div>
                  <div className="font-display text-2xl font-black text-purple-700">
                    ₹{tournament.prizeMoney.bestDefender.toLocaleString('en-IN')}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Important Members */}
      {cfg.showMembers !== false && tournament.members?.length > 0 && (
        <div className="mt-3 panel">
          <h3 className="text-sm font-medium text-ink/60 mb-2">Important Members</h3>
          <div className="flex flex-wrap gap-3">
            {tournament.members.map((m, i) => (
              <span key={i} className="rounded-full bg-chalk px-3 py-1 text-sm">
                {m.name} {m.role && <span className="text-ink/60">({m.role})</span>}
              </span>
            ))}
          </div>
        </div>
      )}

      {tournament.status === 'completed' && tournament.champion && (
        <div className="mt-4 rounded-2xl bg-gold p-5 text-center">
          <p className="text-sm">Champions</p>
          <p className="font-display text-4xl">{tournament.champion.name}</p>
        </div>
      )}

      <Group title="Live now" matches={live} totalRounds={tournament.rounds} />
      <Group title="Coming up" matches={upcoming} totalRounds={tournament.rounds} />

      {/* Match Results with clear Winner, Loser, and Points */}
      {results.length > 0 && (
        <section className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-2xl">🏆 Match Results & Winner/Loser Points</h2>
            <Link to="/bracket" className="text-sm underline font-medium">Full Bracket Tree →</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {results.map((m) => (
              <MatchResultCard key={m._id} match={m} totalRounds={tournament.rounds} />
            ))}
          </div>
        </section>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/bracket" className="btn-dark">See full bracket</Link>
        <Link to="/teams" className="btn-light">All teams</Link>
      </div>
    </>
  );
}
