import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/api.js';
import { useScorerKey } from '../../context/ScorerKeyContext.jsx';
import { useTournament } from '../../hooks/useTournament.js';
import { Loading, ErrorBox } from '../../components/Feedback.jsx';

const nextPow2 = (n) => { let p = 1; while (p < n) p *= 2; return p; };

export default function ManageTournament() {
  const key = useScorerKey();
  const { tournament, matches, loading, reload } = useTournament();
  const [teams, setTeams] = useState([]);
  const [picked, setPicked] = useState(new Set());
  const [shuffle, setShuffle] = useState(true);
  const [name, setName] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [orgName, setOrgName] = useState('');
  const [orgPhone, setOrgPhone] = useState('');
  const [orgVillage, setOrgVillage] = useState('');
  const [members, setMembers] = useState([]);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [prizeWinner, setPrizeWinner] = useState('');
  const [prizeRunner, setPrizeRunner] = useState('');
  const [prizeThird, setPrizeThird] = useState('');
  const [prizeDefender, setPrizeDefender] = useState('');
  const [prizeRaider, setPrizeRaider] = useState('');
  const [bestRaiderName, setBestRaiderName] = useState('');
  const [bestRaiderTeam, setBestRaiderTeam] = useState('');
  const [bestDefenderName, setBestDefenderName] = useState('');
  const [bestDefenderTeam, setBestDefenderTeam] = useState('');
  const [awardsAnnounced, setAwardsAnnounced] = useState(false);

  useEffect(() => {
    api.get('/teams').then((t) => {
      setTeams(t);
      setPicked(new Set(t.map((x) => x._id)));
    }).catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (tournament) {
      if (tournament.organizer) {
        setOrgName(tournament.organizer.name || '');
        setOrgPhone(tournament.organizer.phone || '');
        setOrgVillage(tournament.organizer.village || '');
      }
      if (tournament.members) setMembers(tournament.members);
      if (tournament.prizeMoney) {
        setPrizeWinner(tournament.prizeMoney.winner || '');
        setPrizeRunner(tournament.prizeMoney.runnerUp || '');
        setPrizeThird(tournament.prizeMoney.thirdPlace || '');
        setPrizeDefender(tournament.prizeMoney.bestDefender || '');
        setPrizeRaider(tournament.prizeMoney.bestRaider || '');
      }
      if (tournament.awards) {
        setBestRaiderName(tournament.awards.bestRaider?.playerName || '');
        setBestRaiderTeam(tournament.awards.bestRaider?.teamName || '');
        setBestDefenderName(tournament.awards.bestDefender?.playerName || '');
        setBestDefenderTeam(tournament.awards.bestDefender?.teamName || '');
        setAwardsAnnounced(Boolean(tournament.awards.isAnnounced));
      }
    }
  }, [tournament]);

  if (loading) return <Loading />;

  const toggle = (id) => {
    const next = new Set(picked);
    next.has(id) ? next.delete(id) : next.add(id);
    setPicked(next);
  };

  const create = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/tournaments', {
        name,
        year: Number(year),
        organizer: { name: orgName, phone: orgPhone, village: orgVillage },
        members,
        prizeMoney: {
          winner: Number(prizeWinner) || 0,
          runnerUp: Number(prizeRunner) || 0,
          thirdPlace: Number(prizeThird) || 0,
          bestDefender: Number(prizeDefender) || 0,
          bestRaider: Number(prizeRaider) || 0,
        },
        awards: {
          isAnnounced: awardsAnnounced,
          bestRaider: { playerName: bestRaiderName, teamName: bestRaiderTeam },
          bestDefender: { playerName: bestDefenderName, teamName: bestDefenderTeam },
        },
      }, key);
      setShowNew(false);
      setName('');
      await reload();
    } catch (err) {
      setError(err.message);
    }
  };

  const draw = async () => {
    setError('');
    setNote('');
    const hasBracket = matches.length > 0;
    const started = matches.some((m) => !m.bye && (m.status === 'live' || m.status === 'finished'));
    if (hasBracket && !window.confirm(started
      ? 'Some matches already have scores. Drawing again deletes them. Continue?'
      : 'This replaces the current bracket. Continue?')) return;
    try {
      await api.post(`/tournaments/${tournament._id}/draw`, { teamIds: [...picked], shuffle, force: started }, key);
      setNote('Bracket is ready.');
      await reload();
    } catch (err) {
      setError(err.message);
    }
  };

  const n = picked.size;

  const saveDetails = async () => {
    setError('');
    try {
      await api.put(`/tournaments/${tournament._id}`, {
        organizer: { name: orgName, phone: orgPhone, village: orgVillage },
        members,
        prizeMoney: {
          winner: Number(prizeWinner) || 0,
          runnerUp: Number(prizeRunner) || 0,
          thirdPlace: Number(prizeThird) || 0,
          bestDefender: Number(prizeDefender) || 0,
          bestRaider: Number(prizeRaider) || 0,
        },
        awards: {
          isAnnounced: awardsAnnounced,
          bestRaider: { playerName: bestRaiderName, teamName: bestRaiderTeam },
          bestDefender: { playerName: bestDefenderName, teamName: bestDefenderTeam },
        },
      }, key);
      setNote('Tournament details, 3rd team prize & player awards saved! ✓');
      await reload();
    } catch (err) {
      setError(err.message);
    }
  };

  const addMember = () => {
    if (!newMemberName.trim()) return;
    setMembers([...members, { name: newMemberName.trim(), role: newMemberRole.trim(), phone: newMemberPhone.trim() }]);
    setNewMemberName('');
    setNewMemberRole('');
    setNewMemberPhone('');
  };

  const removeMember = (index) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const size = nextPow2(Math.max(n, 2));

  return (
    <>
      <h1 className="mb-4 text-3xl">Tournament</h1>
      <ErrorBox message={error} />
      {note && <p role="status" className="mb-3 rounded-lg bg-field/10 px-3 py-2 text-field">{note}</p>}

      {(!tournament || showNew) && (
        <form onSubmit={create} className="panel mb-6 grid gap-3 sm:grid-cols-[1fr_120px_auto]">
          <input className="field" placeholder="Tournament name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={80} aria-label="Tournament name" />
          <input className="field" type="number" value={year} onChange={(e) => setYear(e.target.value)} aria-label="Year" />
          <button className="btn-dark">Create</button>
        </form>
      )}

      {tournament && !showNew && (
        <>
          <div className="panel mb-6">
            <p className="font-display text-2xl">{tournament.name} {tournament.year}</p>
            <p className="text-ink/60">Status: {tournament.status}</p>
            {tournament.status === 'completed' && (
              <button className="btn-light mt-3" onClick={() => setShowNew(true)}>Start a new tournament</button>
            )}
          </div>

          {/* Organizer Details */}
          <section className="panel mb-6">
            <h2 className="mb-3 text-2xl">Organizer Details</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <input className="field" placeholder="Organizer name" value={orgName} onChange={(e) => setOrgName(e.target.value)} maxLength={80} />
              <input className="field" placeholder="Phone number" value={orgPhone} onChange={(e) => setOrgPhone(e.target.value)} maxLength={20} />
              <input className="field" placeholder="Village / City" value={orgVillage} onChange={(e) => setOrgVillage(e.target.value)} maxLength={80} />
            </div>
          </section>

          {/* Prize Money */}
          <section className="panel mb-6">
            <h2 className="mb-3 text-2xl font-display">🏆 Prize Money & Cash Awards</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-700">🥇 1st Prize / Champion (₹)</label>
                <input className="field mt-1 border-2 border-emerald-400 font-bold text-lg" type="number" placeholder="e.g. 51000" value={prizeWinner} onChange={(e) => setPrizeWinner(e.target.value)} min={0} />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">🥈 2nd Prize / Runner-Up (₹)</label>
                <input className="field mt-1 border-2 border-slate-400 font-bold text-lg" type="number" placeholder="e.g. 31000" value={prizeRunner} onChange={(e) => setPrizeRunner(e.target.value)} min={0} />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-amber-700">🥉 3rd Prize / 3rd Team (₹)</label>
                <input className="field mt-1 border-2 border-amber-400 font-bold text-lg" type="number" placeholder="e.g. 15000" value={prizeThird} onChange={(e) => setPrizeThird(e.target.value)} min={0} />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-ink/10 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-blue-700">⚡ Best Raider Cash Prize (₹)</label>
                <input className="field mt-1 border-2 border-blue-400 font-bold" type="number" placeholder="e.g. 5100" value={prizeRaider} onChange={(e) => setPrizeRaider(e.target.value)} min={0} />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-purple-700">🛡️ Best Defender Cash Prize (₹)</label>
                <input className="field mt-1 border-2 border-purple-400 font-bold" type="number" placeholder="e.g. 5100" value={prizeDefender} onChange={(e) => setPrizeDefender(e.target.value)} min={0} />
              </div>
            </div>
          </section>

          {/* Individual Player Awards */}
          <section className="panel mb-6">
            <h2 className="mb-3 text-2xl font-display">⭐ Tournament Awards (Player Honors)</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-blue-50/70 border-2 border-blue-300 p-4">
                <span className="rounded bg-blue-600 text-white px-2 py-0.5 text-xs font-black uppercase tracking-wider">
                  ⚡ Best Raider of the Tournament
                </span>
                <div className="mt-2 space-y-2">
                  <input className="field text-sm" placeholder="Player Name (e.g. Rahul Kumar)" value={bestRaiderName} onChange={(e) => setBestRaiderName(e.target.value)} />
                  <input className="field text-sm" placeholder="Team Name (e.g. Meesa Pro)" value={bestRaiderTeam} onChange={(e) => setBestRaiderTeam(e.target.value)} />
                </div>
              </div>

              <div className="rounded-xl bg-purple-50/70 border-2 border-purple-300 p-4">
                <span className="rounded bg-purple-600 text-white px-2 py-0.5 text-xs font-black uppercase tracking-wider">
                  🛡️ Best Defender of the Tournament
                </span>
                <div className="mt-2 space-y-2">
                  <input className="field text-sm" placeholder="Player Name (e.g. Sandeep Narwal)" value={bestDefenderName} onChange={(e) => setBestDefenderName(e.target.value)} />
                  <input className="field text-sm" placeholder="Team Name (e.g. Karbala)" value={bestDefenderTeam} onChange={(e) => setBestDefenderTeam(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Announcement Reveal Switch */}
            <div className="mt-4 p-4 rounded-xl border-2 border-amber-400 bg-amber-50 flex flex-wrap items-center justify-between gap-3 shadow-sm">
              <div>
                <span className="font-display text-lg font-black text-amber-950 flex items-center gap-2">
                  📢 Reveal Player Awards to Public & Screen
                </span>
                <p className="text-xs text-amber-800 font-semibold mt-0.5">
                  Keep hidden during the tournament. Reveal this at the closing ceremony after the final match!
                </p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer font-bold text-sm bg-white px-3.5 py-2 rounded-lg border-2 border-amber-500 shadow-sm">
                <input
                  type="checkbox"
                  checked={awardsAnnounced}
                  onChange={(e) => setAwardsAnnounced(e.target.checked)}
                  className="h-5 w-5 accent-emerald-600"
                />
                {awardsAnnounced ? '✅ REVEALED PUBLICLY' : '🔒 HIDDEN UNTIL END'}
              </label>
            </div>

            <button type="button" className="btn-dark mt-4" onClick={saveDetails}>
              💾 Save Player Awards Now
            </button>
          </section>

          {/* Important Members */}
          <section className="panel mb-6">
            <h2 className="mb-3 text-2xl">Important Members</h2>
            {members.length > 0 && (
              <ul className="mb-3 space-y-2">
                {members.map((m, i) => (
                  <li key={i} className="flex items-center justify-between rounded-lg bg-chalk px-3 py-2">
                    <div>
                      <span className="font-medium">{m.name}</span>
                      {m.role && <span className="text-sm text-ink/60 ml-2">({m.role})</span>}
                      {m.phone && <span className="text-sm text-ink/60 ml-2">📞 {m.phone}</span>}
                    </div>
                    <button type="button" className="text-alert text-sm hover:underline" onClick={() => removeMember(i)}>Remove</button>
                  </li>
                ))}
              </ul>
            )}
            <div className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
              <input className="field" placeholder="Name" value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} maxLength={80} />
              <input className="field" placeholder="Role (e.g. Chief Guest)" value={newMemberRole} onChange={(e) => setNewMemberRole(e.target.value)} maxLength={60} />
              <input className="field" placeholder="Phone" value={newMemberPhone} onChange={(e) => setNewMemberPhone(e.target.value)} maxLength={20} />
              <button type="button" className="btn-light" onClick={addMember}>Add</button>
            </div>
          </section>

          <button className="btn-dark mb-6" onClick={saveDetails}>Save Organizer & Prize Details</button>

          <h2 className="mb-2 text-2xl">Teams playing</h2>
          <ul className="panel grid gap-2 sm:grid-cols-2">
            {teams.map((t) => (
              <li key={t._id}>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={picked.has(t._id)} onChange={() => toggle(t._id)} className="h-5 w-5" />
                  {t.name} <span className="text-sm text-ink/60">{t.village}</span>
                </label>
              </li>
            ))}
            {!teams.length && <li className="text-ink/60">Add teams first.</li>}
          </ul>

          <label className="mt-4 flex items-center gap-2">
            <input type="checkbox" checked={shuffle} onChange={(e) => setShuffle(e.target.checked)} className="h-5 w-5" />
            Mix the teams randomly (draw)
          </label>
          <p className="mt-2 text-sm text-ink/60">
            {n} teams selected. Bracket of {size}{size - n > 0 ? `, ${size - n} team(s) get a bye (skip round 1).` : ', no byes.'}
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <button className="btn-dark" onClick={draw} disabled={n < 2}>Make bracket</button>
            {matches.length > 0 && <Link to={`/manage/${key}/matches`} className="btn-light">Go to matches</Link>}
          </div>
        </>
      )}
    </>
  );
}
