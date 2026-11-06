// Seven dots, one per player. White = on the mat, dashed = out.
// Players coming back pop in, players going out shrink away.
export default function PlayerDots({ alive, out = [], back = [], fxId = 'x' }) {
  const onMat = alive.filter(Boolean).length;
  return (
    <div className="flex justify-center gap-1.5" role="img" aria-label={`${onMat} players on the mat`}>
      {alive.map((on, i) => {
        let cls = 'h-4 w-4 sm:h-5 sm:w-5 rounded-full ';
        if (on) {
          cls += 'bg-white';
          if (back.includes(i)) cls += ' anim-revive';
        } else {
          cls += 'border-2 border-dashed border-white/40 scale-75';
          if (out.includes(i)) cls += ' anim-leave';
        }
        return <span key={`${fxId}-${i}`} className={cls} />;
      })}
    </div>
  );
}
