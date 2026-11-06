import { useEffect, useState } from 'react';
import { toBanner, BANNER_STYLE } from '../utils/effects.js';

// Shows the big animated message (SUPER RAID, DO OR DIE, ALL OUT ...), one after another.
export default function EventBanner({ fx, names }) {
  const [queue, setQueue] = useState([]);
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    if (!fx) return;
    const items = fx.effects.map((e) => toBanner(e, names)).filter(Boolean);
    if (items.length) setQueue((q) => [...q, ...items]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fx?.id]);

  useEffect(() => {
    if (current || !queue.length) return;
    setCurrent({ ...queue[0], key: Math.random() });
    setQueue((q) => q.slice(1));
  }, [queue, current]);

  useEffect(() => {
    if (!current) return undefined;
    const t = setTimeout(() => setCurrent(null), 1500);
    return () => clearTimeout(t);
  }, [current]);

  return (
    <div className="my-3 flex h-14 items-center justify-center" aria-live="polite">
      {current && (
        <div
          key={current.key}
          className={`anim-banner rounded-xl px-5 py-2.5 text-center font-display text-lg sm:text-2xl tracking-wide ${BANNER_STYLE[current.kind]}`}
        >
          {current.text}
        </div>
      )}
    </div>
  );
}
