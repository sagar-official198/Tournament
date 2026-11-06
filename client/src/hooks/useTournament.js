import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/api.js';
import { socket, joinRoom } from '../api/socket.js';

// Current tournament and all its matches, updated live.
export function useTournament() {
  const [tournament, setTournament] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const t = await api.get('/tournaments/current');
      setTournament(t);
      setMatches(t ? await api.get(`/tournaments/${t._id}/matches`) : []);
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const tid = tournament?._id;
  useEffect(() => {
    if (!tid) return undefined;
    const leaveTournament = joinRoom(`tournament:${tid}`);
    const leaveLive = joinRoom('live');

    const onMatch = ({ match }) => {
      if (!match) return;
      setMatches((list) =>
        list.map((m) => (String(m._id) === String(match._id) ? { ...m, ...match } : m))
      );
    };

    const onBracket = () => load();

    const onDisplay = ({ displayConfig }) => {
      if (!displayConfig) return;
      setTournament((t) => (t ? { ...t, displayConfig: { ...(t.displayConfig || {}), ...displayConfig } } : t));
    };

    const onTournament = ({ tournament: updated }) => {
      if (!updated) return;
      setTournament((t) => (t ? { ...t, ...updated } : updated));
    };

    socket.on('match:update', onMatch);
    socket.on('bracket:update', onBracket);
    socket.on('display:update', onDisplay);
    socket.on('tournament:update', onTournament);
    socket.on('connect', load);

    return () => {
      leaveTournament();
      leaveLive();
      socket.off('match:update', onMatch);
      socket.off('bracket:update', onBracket);
      socket.off('display:update', onDisplay);
      socket.off('tournament:update', onTournament);
      socket.off('connect', load);
    };
  }, [tid, load]);

  return { tournament, matches, loading, error, reload: load };
}
