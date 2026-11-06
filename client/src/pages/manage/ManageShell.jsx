import { useEffect, useState } from 'react';
import { NavLink, Outlet, useParams, Link } from 'react-router-dom';
import { api } from '../../api/api.js';
import { ScorerKeyContext } from '../../context/ScorerKeyContext.jsx';
import { Loading } from '../../components/Feedback.jsx';

const tab = ({ isActive }) =>
  `rounded-md px-3 py-1.5 text-sm font-medium ${isActive ? 'bg-white text-ink' : 'text-white/80 hover:text-white'}`;

// No login. The secret link itself is the key: /manage/<SCORER_KEY>
export default function ManageShell() {
  const { key } = useParams();
  const [state, setState] = useState('checking');

  useEffect(() => {
    api.get('/auth/check', key).then(() => setState('ok')).catch(() => setState('bad'));
  }, [key]);

  if (state === 'checking') return <Loading text="Checking link..." />;
  if (state === 'bad') {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-3xl">This link does not work</h1>
        <p className="mt-2 text-ink/60">Ask the organiser for the correct scorer link.</p>
        <Link to="/" className="btn-dark mt-6">Go to scoreboard</Link>
      </div>
    );
  }

  const base = `/manage/${key}`;
  return (
    <ScorerKeyContext.Provider value={key}>
      <header className="bg-ink text-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-3">
          <span className="font-display text-xl tracking-wider">ADMIN</span>
          <nav className="flex gap-1" aria-label="Admin">
            <NavLink to={base} end className={tab}>Dashboard</NavLink>
            <NavLink to={`${base}/teams`} className={tab}>Teams</NavLink>
            <NavLink to={`${base}/tournament`} className={tab}>Tournament</NavLink>
            <NavLink to={`${base}/matches`} className={tab}>Matches</NavLink>
            <Link to="/" className="rounded-md px-3 py-1.5 text-sm text-white/80 hover:text-white">Public site</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </ScorerKeyContext.Provider>
  );
}
