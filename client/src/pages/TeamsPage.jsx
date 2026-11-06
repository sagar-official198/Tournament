import { useEffect, useState } from 'react';
import { api } from '../api/api.js';
import TeamCard from '../components/TeamCard.jsx';
import { Loading, ErrorBox, Empty } from '../components/Feedback.jsx';

export default function TeamsPage() {
  const [teams, setTeams] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/teams').then(setTeams).catch((e) => setError(e.message));
  }, []);

  if (error) return <ErrorBox message={error} />;
  if (!teams) return <Loading />;
  if (!teams.length) return <Empty title="No teams added yet" />;

  return (
    <>
      <h1 className="mb-4 text-4xl">Teams</h1>
      <div className="grid gap-3 sm:grid-cols-2">
        {teams.map((t) => <TeamCard key={t._id} team={t} />)}
      </div>
    </>
  );
}
