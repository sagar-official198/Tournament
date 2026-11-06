import { NavLink, Link } from 'react-router-dom';

const link = ({ isActive }) =>
  `rounded-md px-3 py-1.5 text-sm font-medium ${isActive ? 'bg-white text-ink' : 'text-white/80 hover:text-white'}`;

export default function Navbar() {
  return (
    <header className="sticky top-0 z-20 bg-ink text-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="font-display text-xl tracking-wider">KABADDI</Link>
        <nav className="flex gap-1" aria-label="Main">
          <NavLink to="/" end className={link}>Home</NavLink>
          <NavLink to="/bracket" className={link}>Bracket</NavLink>
          <NavLink to="/teams" className={link}>Teams</NavLink>
          <NavLink to="/screen" className={link} target="_blank">📺 Big Screen</NavLink>
        </nav>
      </div>
    </header>
  );
}
