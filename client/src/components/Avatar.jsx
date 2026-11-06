const initials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || '?';

export default function Avatar({ src, name, size = 'h-12 w-12', className = '' }) {
  if (src) {
    return <img src={src} alt={name || ''} loading="lazy" className={`${size} rounded-full object-cover bg-ink/10 ${className}`} />;
  }
  return (
    <span aria-hidden="true" className={`${size} inline-flex shrink-0 items-center justify-center rounded-full bg-ink text-white font-display ${className}`}>
      {initials(name)}
    </span>
  );
}
