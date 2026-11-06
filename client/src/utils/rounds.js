export function roundLabel(round, totalRounds, isThirdPlace = false) {
  if (isThirdPlace) return '3rd Place Playoff';
  const fromEnd = totalRounds - round;
  if (fromEnd === 0) return 'Final';
  if (fromEnd === 1) return 'Semifinal';
  if (fromEnd === 2) return 'Quarterfinal';
  return `Round of ${2 ** (fromEnd + 1)}`;
}

export const teamName = (team) => team?.name || 'To be decided';

export function formatWhen(date) {
  if (!date) return 'Time not set';
  return new Date(date).toLocaleString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit',
  });
}

// value for <input type="datetime-local">
export function toInputValue(date) {
  if (!date) return '';
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
