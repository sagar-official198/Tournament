import { useEffect, useState } from 'react';
import { api } from '../api/api.js';
import { socket, joinRoom } from '../api/socket.js';

// One match, kept fresh by the server. `fx` holds the latest animation events.
export function useLiveMatch(id) {
  const [match, setMatch] = useState(null);
  const [fx, setFx] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      setMatch(null);
      return;
    }
    let active = true;
    setError('');
    const load = () =>
      api
        .get(`/matches/${id}`)
        .then((m) => {
          if (active) setMatch(m);
        })
        .catch((e) => {
          if (active) setError(e.message);
        });
    load();

    const leave = joinRoom(`match:${id}`);
    const onUpdate = (payload) => {
      if (!payload?.match) return;
      if (String(payload.match._id) !== String(id)) return;
      setMatch(payload.match);
      if (payload.effects?.length) {
        setFx({ id: `${Date.now()}-${Math.random()}`, ...payload });
      }
    };
    socket.on('match:update', onUpdate);
    socket.on('connect', load); // refresh after a dropped connection

    return () => {
      active = false;
      leave();
      socket.off('match:update', onUpdate);
      socket.off('connect', load);
    };
  }, [id]);

  return { match, setMatch, fx, error };
}
