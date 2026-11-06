import { Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import BracketPage from './pages/BracketPage.jsx';
import TeamsPage from './pages/TeamsPage.jsx';
import TeamDetail from './pages/TeamDetail.jsx';
import MatchPage from './pages/MatchPage.jsx';
import ArenaDisplay from './pages/ArenaDisplay.jsx';
import ManageShell from './pages/manage/ManageShell.jsx';
import ManageDashboard from './pages/manage/ManageDashboard.jsx';
import ManageTeams from './pages/manage/ManageTeams.jsx';
import ManageTeamEdit from './pages/manage/ManageTeamEdit.jsx';
import ManageTournament from './pages/manage/ManageTournament.jsx';
import ManageMatches from './pages/manage/ManageMatches.jsx';
import ScorerPanel from './pages/manage/ScorerPanel.jsx';

function PublicLayout() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/bracket" element={<BracketPage />} />
        <Route path="/teams" element={<TeamsPage />} />
        <Route path="/teams/:id" element={<TeamDetail />} />
        <Route path="/match/:id" element={<MatchPage />} />
        <Route path="*" element={<p className="py-10 text-center">Page not found.</p>} />
      </Route>

      {/* Fullscreen Arena / Projector Big Screen */}
      <Route path="/screen" element={<ArenaDisplay />} />

      {/* Secret scorer link, no login: /manage/<SCORER_KEY> */}
      <Route path="/manage/:key" element={<ManageShell />}>
        <Route index element={<ManageDashboard />} />
        <Route path="teams" element={<ManageTeams />} />
        <Route path="teams/:teamId" element={<ManageTeamEdit />} />
        <Route path="tournament" element={<ManageTournament />} />
        <Route path="matches" element={<ManageMatches />} />
        <Route path="score/:matchId" element={<ScorerPanel />} />
      </Route>
    </Routes>
  );
}

