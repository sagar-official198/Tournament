import crypto from 'crypto';

// No login. The person who scores opens the secret link /manage/<SCORER_KEY>.
// The browser sends that key in the x-scorer-key header on every write request.
const failures = new Map(); // ip -> { count, resetAt }
const MAX_FAILS = 10;
const WINDOW_MS = 10 * 60 * 1000;

export function requireScorerKey(req, res, next) {
  const real = String(process.env.SCORER_KEY || '');
  if (!real) return res.status(500).json({ message: 'SCORER_KEY is not set in server/.env' });

  const ip = req.ip;
  const entry = failures.get(ip);
  if (entry && entry.resetAt > Date.now() && entry.count >= MAX_FAILS) {
    return res.status(429).json({ message: 'Too many wrong attempts. Try again in a few minutes.' });
  }

  const given = Buffer.from(String(req.get('x-scorer-key') || ''));
  const wanted = Buffer.from(real);
  const ok = given.length === wanted.length && crypto.timingSafeEqual(given, wanted);

  if (!ok) {
    const fresh = !entry || entry.resetAt <= Date.now();
    failures.set(ip, { count: fresh ? 1 : entry.count + 1, resetAt: fresh ? Date.now() + WINDOW_MS : entry.resetAt });
    return res.status(401).json({ message: 'This scorer link is not valid.' });
  }
  failures.delete(ip);
  next();
}
