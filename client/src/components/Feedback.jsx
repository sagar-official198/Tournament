export function Loading({ text = 'Loading...' }) {
  return <p className="py-10 text-center text-ink/60" role="status">{text}</p>;
}

export function ErrorBox({ message }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-lg border border-alert/30 bg-alert/10 px-3 py-2 text-alert">
      {message}
    </p>
  );
}

export function Empty({ title, children }) {
  return (
    <div className="panel text-center py-10">
      <p className="font-display text-xl">{title}</p>
      {children && <p className="mt-1 text-ink/60">{children}</p>}
    </div>
  );
}
