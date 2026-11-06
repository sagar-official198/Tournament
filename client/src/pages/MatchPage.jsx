import { Link, useParams } from 'react-router-dom';
import { useLiveMatch } from '../hooks/useLiveMatch.js';
import { useTournament } from '../hooks/useTournament.js';
import Scoreboard from '../components/Scoreboard.jsx';
import EventBanner from '../components/EventBanner.jsx';
import { Loading, ErrorBox } from '../components/Feedback.jsx';
import { roundLabel, formatWhen } from '../utils/rounds.js';

export default function MatchPage() {
  const { id } = useParams();
  const { match, fx, error } = useLiveMatch(id);
  const { tournament } = useTournament();

  if (error) return <ErrorBox message={error} />;
  if (!match) return <Loading />;

  const names = [match.teamA?.name, match.teamB?.name];
  return (
    <>
      <Link to="/bracket" className="text-sm underline">Bracket</Link>
      <h1 className="mb-1 mt-2 text-3xl">
        {tournament ? roundLabel(match.round, tournament.rounds) : 'Match'}, match {match.matchNumber}
      </h1>
      <p className="text-ink/60">
        {formatWhen(match.scheduledAt)}{match.ground ? `, ${match.ground}` : ''}
      </p>

      <div className="mt-4">
        <Scoreboard match={match} fx={fx} />
        <EventBanner fx={fx} names={names} />
      </div>

      <div className="mt-2 flex flex-wrap gap-3">
        {match.teamA && <Link to={`/teams/${match.teamA._id}`} className="btn-light">{match.teamA.name} squad</Link>}
        {match.teamB && <Link to={`/teams/${match.teamB._id}`} className="btn-light">{match.teamB.name} squad</Link>}
      </div>

      <h2 className="mb-2 mt-8 text-2xl">Match log</h2>
      {match.log?.length ? (
        <ol className="panel space-y-1.5">
          {[...match.log].reverse().map((l, i) => (
            <li key={`${l.at}-${i}`} className="text-sm">{l.text}</li>
          ))}
        </ol>
      ) : (
        <p className="text-ink/60">Nothing yet. The log fills up once the match starts.</p>
      )}
    </>
  );
}
