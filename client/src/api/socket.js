import { io } from 'socket.io-client';

export const socket = io(import.meta.env.VITE_API_URL || undefined);

// Several components can watch the same room, so count the watchers.
const counts = new Map();

socket.on('connect', () => {
  for (const room of counts.keys()) socket.emit('join', room);
});

export function joinRoom(room) {
  counts.set(room, (counts.get(room) || 0) + 1);
  if (socket.connected) socket.emit('join', room);
  return () => {
    const left = (counts.get(room) || 1) - 1;
    if (left <= 0) {
      counts.delete(room);
      socket.emit('leave', room);
    } else {
      counts.set(room, left);
    }
  };
}
