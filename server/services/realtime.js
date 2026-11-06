import { getIO } from '../sockets/io.js';

// Send a changed match to everyone watching it, the tournament page and the home page.
export function emitMatch(match, extra = {}) {
  const io = getIO();
  if (!io || !match) return;
  const payload = { match, effects: [], out: [[], []], back: [[], []], ...extra };
  const matchId = String(match._id);
  const tournamentId = String(match.tournament?._id || match.tournament);
  io.to(`match:${matchId}`).to(`tournament:${tournamentId}`).to('live').emit('match:update', payload);
}

export function emitBracket(tournamentId) {
  const io = getIO();
  if (!io || !tournamentId) return;
  const tid = String(tournamentId);
  io.to(`tournament:${tid}`).to('live').emit('bracket:update', { tournamentId: tid });
}

export function emitDisplay(tournamentId, displayConfig) {
  const io = getIO();
  if (!io || !tournamentId) return;
  const tid = String(tournamentId);
  io.to(`tournament:${tid}`).to('live').emit('display:update', { tournamentId: tid, displayConfig });
}

export function emitTournament(tournament) {
  const io = getIO();
  if (!io || !tournament) return;
  const tid = String(tournament._id || tournament);
  io.to(`tournament:${tid}`).to('live').emit('tournament:update', { tournament });
}
