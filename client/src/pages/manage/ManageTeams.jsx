import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/api.js';
import { useScorerKey } from '../../context/ScorerKeyContext.jsx';
import { Loading, ErrorBox } from '../../components/Feedback.jsx';
import Avatar from '../../components/Avatar.jsx';

export default function ManageTeams() {
  const key = useScorerKey();
  const navigate = useNavigate();
  const [teams, setTeams] = useState(null);
  const [name, setName] = useState('');
  const [village, setVillage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get('/teams').then(setTeams).catch((e) => setError(e.message));
  }, []);

  const add = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const team = await api.post('/teams', { name, village }, key);
      navigate(`/manage/${key}/teams/${team._id}`);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <>
      <h1 className="mb-4 text-3xl">Teams</h1>
      <form onSubmit={add} className="panel mb-6 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <input className="field" placeholder="Team name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={60} aria-label="Team name" />
        <input className="field" placeholder="Village" value={village} onChange={(e) => setVillage(e.target.value)} maxLength={60} aria-label="Village" />
        <button className="btn-dark" disabled={busy}>Add team</button>
      </form>
      <ErrorBox message={error} />

      {!teams ? <Loading /> : (
        <ul className="mt-4 space-y-2">
          {teams.map((t) => (
            <li key={t._id}>
              <Link to={`/manage/${key}/teams/${t._id}`} className="panel flex items-center gap-3 hover:border-ink/40">
                <Avatar src={t.logo} name={t.name} />
                <span className="font-medium">{t.name}</span>
                <span className="text-sm text-ink/60">{t.village}</span>
              </Link>
            </li>
          ))}
          {!teams.length && <li className="text-ink/60">No teams yet. Add the first one above.</li>}
        </ul>
      )}
    </>
  );
}
