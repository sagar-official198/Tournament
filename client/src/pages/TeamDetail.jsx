import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/api.js';
import Avatar from '../components/Avatar.jsx';
import PlayerCard from '../components/PlayerCard.jsx';
import { Loading, ErrorBox, Empty } from '../components/Feedback.jsx';

export default function TeamDetail() {
  const { id } = useParams();
  const [team, setTeam] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setTeam(null);
    api.get(`/teams/${id}`).then(setTeam).catch((e) => setError(e.message));
  }, [id]);

  if (error) return <ErrorBox message={error} />;
  if (!team) return <Loading />;

  const captainId = team.captain?._id;
  return (
    <>
      <Link to="/teams" className="text-sm underline">All teams</Link>
      {team.teamPhoto && (
        <img src={team.teamPhoto} alt={`${team.name} team`} className="mt-3 h-56 w-full rounded-2xl object-cover sm:h-72" />
      )}
      <div className="mt-4 flex items-center gap-4">
        <Avatar src={team.logo} name={team.name} size="h-16 w-16" />
        <div>
          <h1 className="text-4xl leading-tight">{team.name}</h1>
          <p className="text-ink/60">{team.village}</p>
          {team.captain && <p>Captain: <strong>{team.captain.name}</strong></p>}
        </div>
      </div>

      <h2 className="mb-3 mt-8 text-2xl">Players</h2>
      {team.players?.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {team.players.map((p) => <PlayerCard key={p._id} player={p} isCaptain={p._id === captainId} />)}
        </div>
      ) : (
        <Empty title="No players added yet" />
      )}
    </>
  );
}
