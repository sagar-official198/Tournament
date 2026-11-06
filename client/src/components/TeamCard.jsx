import { Link } from 'react-router-dom';
import Avatar from './Avatar.jsx';

export default function TeamCard({ team }) {
  return (
    <Link to={`/teams/${team._id}`} className="panel flex items-center gap-3 hover:border-ink/40">
      <Avatar src={team.logo} name={team.name} size="h-14 w-14" />
      <div className="min-w-0">
        <p className="truncate font-display text-lg">{team.name}</p>
        <p className="truncate text-sm text-ink/60">{team.village || 'Village not added'}</p>
        {team.captain && <p className="truncate text-sm">Captain: {team.captain.name}</p>}
      </div>
    </Link>
  );
}
