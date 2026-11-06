import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api/api.js';
import { useScorerKey } from '../../context/ScorerKeyContext.jsx';
import ImageField from '../../components/ImageField.jsx';
import PlayerCard from '../../components/PlayerCard.jsx';
import { Loading, ErrorBox } from '../../components/Feedback.jsx';

const EMPTY_PLAYER = { name: '', jerseyNo: '', role: 'all-rounder', age: '', photo: '' };

export default function ManageTeamEdit() {
  const key = useScorerKey();
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [form, setForm] = useState({ name: '', village: '' });
  const [player, setPlayer] = useState(EMPTY_PLAYER);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');

  const load = useCallback(async () => {
    try {
      const t = await api.get(`/teams/${teamId}`);
      setTeam(t);
      setForm({ name: t.name, village: t.village || '' });
    } catch (e) {
      setError(e.message);
    }
  }, [teamId]);

  useEffect(() => { load(); }, [load]);

  const run = async (fn, okMessage) => {
    setError('');
    setNote('');
    try {
      await fn();
      if (okMessage) setNote(okMessage);
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const saveTeam = (e) => {
    e.preventDefault();
    run(() => api.put(`/teams/${teamId}`, form, key), 'Team saved.');
  };
  const savePhoto = (field) => (url) => run(() => api.put(`/teams/${teamId}`, { [field]: url }, key), 'Photo saved.');

  const addPlayer = (e) => {
    e.preventDefault();
    const body = {
      name: player.name,
      role: player.role,
      photo: player.photo,
      ...(player.jerseyNo !== '' && { jerseyNo: Number(player.jerseyNo) }),
      ...(player.age !== '' && { age: Number(player.age) }),
    };
    run(async () => {
      await api.post(`/teams/${teamId}/players`, body, key);
      setPlayer(EMPTY_PLAYER);
    }, 'Player added.');
  };

  const removeTeam = async () => {
    if (!window.confirm(`Delete ${team.name} and all its players?`)) return;
    try {
      await api.del(`/teams/${teamId}`, key);
      navigate(`/manage/${key}`);
    } catch (e) {
      setError(e.message);
    }
  };

  if (!team) return error ? <ErrorBox message={error} /> : <Loading />;
  const captainId = team.captain?._id;

  return (
    <>
      <Link to={`/manage/${key}`} className="text-sm underline">All teams</Link>
      <h1 className="mb-4 mt-2 text-3xl">{team.name}</h1>
      <ErrorBox message={error} />
      {note && <p role="status" className="mb-3 rounded-lg bg-field/10 px-3 py-2 text-field">{note}</p>}

      <form onSubmit={saveTeam} className="panel grid gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-medium">Team name
            <input className="field mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required maxLength={60} />
          </label>
          <label className="text-sm font-medium">Village
            <input className="field mt-1" value={form.village} onChange={(e) => setForm({ ...form, village: e.target.value })} maxLength={60} />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <ImageField label="Team logo" name={team.name} value={team.logo} onChange={savePhoto('logo')} scorerKey={key} />
          <ImageField label="Team photo" name={team.name} value={team.teamPhoto} onChange={savePhoto('teamPhoto')} scorerKey={key} />
        </div>
        <button className="btn-dark w-fit">Save team</button>
      </form>

      <h2 className="mb-3 mt-8 text-2xl">Players</h2>
      <form onSubmit={addPlayer} className="panel mb-4 grid gap-3">
        <div className="grid gap-3 sm:grid-cols-4">
          <input className="field sm:col-span-2" placeholder="Player name" value={player.name} onChange={(e) => setPlayer({ ...player, name: e.target.value })} required maxLength={60} aria-label="Player name" />
          <input className="field" type="number" min="0" max="999" placeholder="Jersey no." value={player.jerseyNo} onChange={(e) => setPlayer({ ...player, jerseyNo: e.target.value })} aria-label="Jersey number" />
          <input className="field" type="number" min="5" max="70" placeholder="Age" value={player.age} onChange={(e) => setPlayer({ ...player, age: e.target.value })} aria-label="Age" />
        </div>
        <select className="field sm:w-60" value={player.role} onChange={(e) => setPlayer({ ...player, role: e.target.value })} aria-label="Role">
          <option value="raider">Raider</option>
          <option value="defender">Defender</option>
          <option value="all-rounder">All-rounder</option>
        </select>
        <ImageField label="Player photo" name={player.name} value={player.photo} onChange={(url) => setPlayer({ ...player, photo: url })} scorerKey={key} />
        <button className="btn-dark w-fit">Add player</button>
      </form>

      <ul className="grid gap-3 sm:grid-cols-2">
        {team.players?.map((p) => (
          <li key={p._id}>
            <PlayerCard player={p} isCaptain={p._id === captainId} />
            <div className="mt-1 flex gap-3 text-sm">
              {p._id !== captainId && (
                <button className="underline" onClick={() => run(() => api.put(`/teams/${teamId}/captain`, { playerId: p._id }, key), 'Captain set.')}>Make captain</button>
              )}
              <button className="text-alert underline" onClick={() => window.confirm(`Remove ${p.name}?`) && run(() => api.del(`/players/${p._id}`, key))}>Remove</button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-10 border-t border-ink/10 pt-4">
        <button className="btn-danger" onClick={removeTeam}>Delete this team</button>
      </div>
    </>
  );
}
