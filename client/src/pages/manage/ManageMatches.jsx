import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/api.js';
import { useScorerKey } from '../../context/ScorerKeyContext.jsx';
import { useTournament } from '../../hooks/useTournament.js';
import StatusBadge from '../../components/StatusBadge.jsx';
import { Loading, ErrorBox, Empty } from '../../components/Feedback.jsx';
import { roundLabel, teamName, toInputValue } from '../../utils/rounds.js';

function MatchRow({ match }) {
  const key = useScorerKey();
  const navigate = useNavigate();
  const [when, setWhen] = useState(toInputValue(match.scheduledAt));
  const [ground, setGround] = useState(match.ground || '');
  const [first, setFirst] = useState('A');
  const [halfMins, setHalfMins] = useState(match.halfDuration ? Math.round(match.halfDuration / 60) : 15);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');

  const save = async () => {
    setError('');
    setNote('');
    try {
      await api.put(`/matches/${match._id}/schedule`, {
        scheduledAt: when ? new Date(when).toISOString() : null,
        ground,
        halfDurationMinutes: Number(halfMins),
      }, key);
      setNote('Saved match time & duration.');
    } catch (e) {
      setError(e.message);
    }
  };

  const start = async () => {
    setError('');
    try {
      await api.post(`/matches/${match._id}/start`, {
        firstRaid: first,
        halfDurationMinutes: Number(halfMins),
      }, key);
      try {
        await api.put(`/tournaments/${match.tournament}/display`, {
          activeScreen: 'live_match',
          featuredMatch: match._id,
        }, key);
      } catch (_) {}
      navigate(`/manage/${key}/score/${match._id}`);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <li className="panel">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {match.isThirdPlace && (
            <span className="rounded bg-amber-700 text-white px-2 py-0.5 text-xs font-black uppercase">
              🥉 3rd Place Match
            </span>
          )}
          <p className="font-medium">
            {teamName(match.teamA)} <span className="text-ink/50">vs</span> {teamName(match.teamB)}
          </p>
        </div>
        <StatusBadge status={match.status} />
      </div>

      {match.status === 'finished' && (
        <div className="mt-2 rounded-xl bg-chalk p-3 text-sm border border-ink/10">
          <div className="flex items-center justify-between">
            <span className="font-bold text-field flex items-center gap-1.5">
              {match.isThirdPlace ? '🥉 3RD PLACE WINNER:' : '🏆 WINNER:'} {match.winner?.name || (match.scoreA > match.scoreB ? teamName(match.teamA) : teamName(match.teamB))}
            </span>
            <span className="font-display text-xl font-bold tabular-nums">
              {match.scoreA} - {match.scoreB}
            </span>
          </div>
          <p className="text-xs text-ink/70 mt-1">
            {teamName(match.teamA)}: <strong className="font-bold">{match.scoreA} pts</strong> • {teamName(match.teamB)}: <strong className="font-bold">{match.scoreB} pts</strong> (Margin: {Math.abs(match.scoreA - match.scoreB)} pts)
          </p>
        </div>
      )}

      {match.status === 'live' && (
        <Link to={`/manage/${key}/score/${match._id}`} className="btn-danger mt-3">Open scorer</Link>
      )}

      {match.status === 'upcoming' && (
        <div className="mt-3 space-y-2">
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <input className="field" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} aria-label="Match time" />
            <input className="field" placeholder="Ground" value={ground} onChange={(e) => setGround(e.target.value)} maxLength={60} aria-label="Ground" />
            <button className="btn-light" onClick={save}>Save time</button>
          </div>

          {/* Half Duration Selector */}
          <div className="flex flex-wrap items-center gap-2 rounded-xl bg-amber-50 border border-amber-300 px-3 py-2">
            <span className="text-xs font-black uppercase text-amber-800">⏱ Half Duration (प्रत्येक हाफ का समय):</span>
            {[10, 15, 20].map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setHalfMins(m)}
                className={`px-2.5 py-1 rounded text-xs font-black transition ${halfMins == m ? 'bg-amber-500 text-white shadow' : 'bg-white border border-amber-300 text-amber-800 hover:bg-amber-100'}`}
              >
                {m} Min
              </button>
            ))}
            <div className="flex items-center gap-1 ml-1">
              <input
                type="number" min={1} max={60}
                value={halfMins}
                onChange={(e) => setHalfMins(e.target.value)}
                className="w-14 rounded border px-2 py-1 text-xs font-bold"
              />
              <span className="text-xs text-amber-800 font-bold">min</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-sm">
              First raid by
              <select className="field w-auto" value={first} onChange={(e) => setFirst(e.target.value)}>
                <option value="A">{teamName(match.teamA)}</option>
                <option value="B">{teamName(match.teamB)}</option>
              </select>
            </label>
            <button className="btn-dark" onClick={start}>Start match ({halfMins} min)</button>
          </div>
        </div>
      )}

      {note && <p role="status" className="mt-2 text-sm text-field">{note}</p>}
      <div className="mt-2"><ErrorBox message={error} /></div>
    </li>
  );
}

export default function ManageMatches() {
  const { tournament, matches, loading, error } = useTournament();
  if (loading) return <Loading />;
  if (error) return <ErrorBox message={error} />;
  if (!tournament || !matches.length) {
    return <Empty title="No matches yet">Make the bracket on the Tournament tab first.</Empty>;
  }

  const rounds = [...new Set(matches.map((m) => m.round))].sort((a, b) => a - b);
  return (
    <>
      <h1 className="mb-4 text-3xl">Matches</h1>
      {rounds.map((r) => (
        <section key={r} className="mb-8">
          <h2 className="mb-2 text-2xl">{roundLabel(r, tournament.rounds)}</h2>
          <ul className="space-y-3">
            {matches.filter((m) => m.round === r && !m.bye).map((m) => <MatchRow key={m._id} match={m} />)}
          </ul>
        </section>
      ))}
    </>
  );
}
