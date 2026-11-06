import Avatar from './Avatar.jsx';

const ROLE = { raider: 'Raider', defender: 'Defender', 'all-rounder': 'All-rounder' };

export default function PlayerCard({ player, isCaptain }) {
  return (
    <div className="panel flex items-center gap-3">
      <Avatar src={player.photo} name={player.name} size="h-14 w-14" />
      <div className="min-w-0">
        <p className="truncate font-medium">
          {player.name}
          {isCaptain && <span className="ml-2 rounded bg-gold px-1.5 py-0.5 text-xs">Captain</span>}
        </p>
        <p className="text-sm text-ink/60">
          {player.jerseyNo !== undefined && player.jerseyNo !== null ? `#${player.jerseyNo}, ` : ''}
          {ROLE[player.role] || 'Player'}
          {player.age ? `, ${player.age} yrs` : ''}
        </p>
      </div>
    </div>
  );
}
