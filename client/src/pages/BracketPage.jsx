import { useTournament } from '../hooks/useTournament.js';
import Bracket from '../components/Bracket.jsx';
import { Loading, ErrorBox, Empty } from '../components/Feedback.jsx';

export default function BracketPage() {
  const { tournament, matches, loading, error } = useTournament();
  if (loading) return <Loading />;
  if (error) return <ErrorBox message={error} />;
  if (!tournament || !matches.length) {
    return <Empty title="No bracket yet">The bracket appears here once the teams are drawn.</Empty>;
  }
  return (
    <>
      <h1 className="text-4xl">Bracket</h1>
      <p className="mb-5 text-ink/60">Win and move right. Lose and you are out.</p>
      <Bracket matches={matches} totalRounds={tournament.rounds} tournament={tournament} />
    </>
  );
}
