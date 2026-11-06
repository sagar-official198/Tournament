// Turns an event from the scoring engine into the words shown in the animated banner.
export const BANNER_STYLE = {
  danger: 'bg-alert text-white',
  warn: 'bg-gold text-ink',
  ok: 'bg-field text-white',
  info: 'bg-mat text-white',
};

export function toBanner(effect, names) {
  const n = (t) => names?.[t] || `Team ${t === 0 ? 'A' : 'B'}`;
  switch (effect.type) {
    case 'SUPER_RAID': return { kind: 'warn', text: `SUPER RAID! ${n(effect.team)} +${effect.points}` };
    case 'RAID': return { kind: 'ok', text: `${n(effect.team)} raid +${effect.points}${effect.bonus ? ' (with bonus)' : ''}` };
    case 'TACKLE': return { kind: 'ok', text: `Tackle! ${n(effect.team)} +${effect.points}` };
    case 'SUPER_TACKLE': return { kind: 'info', text: `SUPER TACKLE! ${n(effect.team)} +${effect.points}` };
    case 'EMPTY_RAID': return { kind: 'info', text: `Empty raid (${effect.count} in a row)` };
    case 'DO_OR_DIE_NEXT': return { kind: 'danger', text: `${n(effect.team)}: next raid is DO OR DIE` };
    case 'DO_OR_DIE_FAILED': return { kind: 'danger', text: `DO OR DIE failed! Raider out, ${n(1 - effect.team)} +1` };
    case 'ALL_OUT': return { kind: 'danger', text: `ALL OUT! ${n(effect.by)} +${effect.points}` };
    case 'BONUS_IGNORED': return { kind: 'info', text: 'Bonus line is off, bonus not counted' };
    case 'MATCH_START': return { kind: 'info', text: 'Match started' };
    case 'MATCH_END': return { kind: 'ok', text: 'Match finished' };
    case 'UNDO': return { kind: 'info', text: 'Last action undone' };
    default: return null;
  }
}
