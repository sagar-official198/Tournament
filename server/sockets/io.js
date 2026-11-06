import { Server } from 'socket.io';

let io;
const ROOM = /^(match|tournament):[a-f0-9]{24}$|^live$/;

export function initIO(httpServer, corsOrigin) {
  io = new Server(httpServer, { cors: { origin: corsOrigin, methods: ['GET', 'POST'] } });
  io.on('connection', (socket) => {
    socket.on('join', (room) => {
      if (typeof room === 'string' && ROOM.test(room)) socket.join(room);
    });
    socket.on('leave', (room) => {
      if (typeof room === 'string') socket.leave(room);
    });
  });
  return io;
}

export const getIO = () => io;
