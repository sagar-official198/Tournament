const STYLES = {
  live: 'bg-red-600 text-white font-bold shadow-sm',
  upcoming: 'bg-amber-500 text-slate-950 font-bold shadow-sm',
  waiting: 'bg-slate-200 text-slate-700 font-semibold',
  finished: 'bg-emerald-600 text-white font-bold shadow-sm',
};
const LABEL = { live: '🔴 LIVE', upcoming: '⏳ Upcoming', waiting: 'Waiting', finished: '✓ Finished' };

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs ${STYLES[status] || STYLES.waiting}`}>
      {status === 'live' && <span className="h-1.5 w-1.5 rounded-full bg-white anim-live" />}
      {LABEL[status] || status}
    </span>
  );
}
