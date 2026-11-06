import Match from '../models/Match.js';
import { RULES } from '../config/rules.js';
import { createState, applyEvent, describe } from '../utils/kabaddiEngine.js';
import { loadMatch, populateMatch, advanceWinner } from '../services/matchService.js';
import { emitMatch, emitBracket } from '../services/realtime.js';
import { asyncHandler, HttpError } from '../utils/asyncHandler.js';

const names = (m) => [m.teamA?.name, m.teamB?.name];

async function getOr404(id) {
  const m = await loadMatch(id);
  if (!m) throw new HttpError(404, 'Match not found.');
  return m;
}

export const liveMatches = asyncHandler(async (req, res) => {
  const matches = await populateMatch(Match.find({ status: 'live' }).sort({ updatedAt: -1 }));
  res.json(matches);
});

export const getMatch = asyncHandler(async (req, res) => {
  res.json(await getOr404(req.params.id));
});

export const scheduleMatch = asyncHandler(async (req, res) => {
  const m = await getOr404(req.params.id);
  if (m.status === 'finished') throw new HttpError(409, 'This match is already finished.');
  const { scheduledAt, ground, halfDuration, halfDurationMinutes } = req.body;
  if (scheduledAt !== undefined) m.scheduledAt = scheduledAt || null;
  if (ground !== undefined) m.ground = ground;
  if (halfDurationMinutes !== undefined) {
    const dur = Math.max(60, Number(halfDurationMinutes) * 60);
    m.halfDuration = dur;
    m.timeRemaining = dur;
  } else if (halfDuration !== undefined) {
    const dur = Math.max(60, Number(halfDuration));
    m.halfDuration = dur;
    m.timeRemaining = dur;
  }
  await m.save();
  const json = (await getOr404(m._id)).toJSON();
  emitMatch(json);
  emitBracket(m.tournament);
  res.json(json);
});

export const startMatch = asyncHandler(async (req, res) => {
  const m = await populateMatch(Match.findById(req.params.id).select('+history'));
  if (!m) throw new HttpError(404, 'Match not found.');
  if (m.status !== 'upcoming') throw new HttpError(409, 'Both teams must be known and the match not started yet.');
  const first = req.body.firstRaid === 'B' ? 1 : 0;

  // Determine half duration (priority: req.body -> match.halfDuration -> tournament default -> 900s / 15m)
  let duration = 900;
  if (req.body.halfDurationMinutes) {
    duration = Math.max(60, Number(req.body.halfDurationMinutes) * 60);
  } else if (req.body.halfDuration) {
    duration = Math.max(60, Number(req.body.halfDuration));
  } else if (m.halfDuration && m.halfDuration > 0) {
    duration = m.halfDuration;
  } else {
    try {
      const Tournament = (await import('../models/Tournament.js')).default;
      const t = await Tournament.findById(m.tournament);
      if (t?.matchRules?.halfDuration) {
        duration = t.matchRules.halfDuration;
      }
    } catch (_) {}
  }

  m.status = 'live';
  m.scoreA = 0;
  m.scoreB = 0;
  m.state = createState(first);
  m.half = 1;
  m.halfDuration = duration;
  m.timeRemaining = duration;
  m.isPaused = true;
  m.timerStartedAt = null;
  m.halfTimeScoreA = null;
  m.halfTimeScoreB = null;
  m.history = [];
  m.log = [{ text: `Match started (${Math.round(duration / 60)} min per half). ${names(m)[first]} raids first.` }];
  m.markModified('state');
  await m.save();
  const json = (await getOr404(m._id)).toJSON();

  // Auto-feature this match on Big Screen so arena screen jumps straight to live scoreboard
  try {
    const Tournament = (await import('../models/Tournament.js')).default;
    const t = await Tournament.findById(m.tournament);
    if (t) {
      t.displayConfig = {
        ...(t.displayConfig?.toObject?.() || {}),
        activeScreen: 'live_match',
        featuredMatch: m._id,
      };
      await t.save();
      emitDisplay(t._id, t.displayConfig);
    }
  } catch (err) {
    console.error('Failed to auto-update displayConfig on match start:', err);
  }

  emitMatch(json, { effects: [{ type: 'MATCH_START' }] });
  emitBracket(m.tournament);
  res.json(json);
});

export const addEvent = asyncHandler(async (req, res) => {
  const m = await Match.findById(req.params.id).select('+history');
  if (!m) throw new HttpError(404, 'Match not found.');
  if (m.status !== 'live') throw new HttpError(409, 'This match is not live.');

  const result = applyEvent(m.state, req.body);
  if (result.error) throw new HttpError(400, result.error);

  const teams = await loadMatch(m._id);
  m.history.push({ state: m.state, scoreA: m.scoreA, scoreB: m.scoreB, logLen: m.log.length });
  if (m.history.length > RULES.historyLimit) m.history.shift();

  m.state = result.state;
  m.scoreA = result.state.score[0];
  m.scoreB = result.state.score[1];
  m.log.push({ text: describe(result.effects, names(teams), result.raider) });
  if (m.log.length > 100) m.log.shift();
  m.markModified('state');
  m.markModified('history');
  await m.save();

  const json = (await getOr404(m._id)).toJSON();
  emitMatch(json, { effects: result.effects, out: result.out, back: result.back });
  res.json(json);
});

export const undoEvent = asyncHandler(async (req, res) => {
  const m = await Match.findById(req.params.id).select('+history');
  if (!m) throw new HttpError(404, 'Match not found.');
  if (m.status !== 'live') throw new HttpError(409, 'This match is not live.');
  if (!m.history.length) throw new HttpError(409, 'Nothing to undo.');

  const snap = m.history.pop();
  m.state = snap.state;
  m.scoreA = snap.scoreA;
  m.scoreB = snap.scoreB;
  m.log = m.log.slice(0, snap.logLen);
  m.log.push({ text: 'Last action undone' });
  m.markModified('state');
  m.markModified('history');
  await m.save();

  const json = (await getOr404(m._id)).toJSON();
  emitMatch(json, { effects: [{ type: 'UNDO' }] });
  res.json(json);
});

export const finishMatch = asyncHandler(async (req, res) => {
  const m = await Match.findById(req.params.id);
  if (!m) throw new HttpError(404, 'Match not found.');
  if (m.status !== 'live') throw new HttpError(409, 'This match is not live.');
  if (m.scoreA === m.scoreB) {
    throw new HttpError(409, 'Scores are tied. A knockout needs a winner: play extra time or a golden raid, score it here, then finish.');
  }
  m.winner = m.scoreA > m.scoreB ? m.teamA : m.teamB;
  m.status = 'finished';
  m.log.push({ text: 'Match finished' });
  await m.save();
  await advanceWinner(m);

  const json = (await getOr404(m._id)).toJSON();
  emitMatch(json, { effects: [{ type: 'MATCH_END' }] });
  res.json(json);
});

export const timerControl = asyncHandler(async (req, res) => {
  const m = await Match.findById(req.params.id);
  if (!m) throw new HttpError(404, 'Match not found.');
  if (m.status !== 'live') throw new HttpError(409, 'This match is not live.');

  const { action, halfDuration, halfDurationMinutes, delta, timeRemaining, resetTimeRemaining } = req.body;
  if (action === 'start' || action === 'resume') {
    if (!m.isPaused) throw new HttpError(409, 'Timer is already running.');
    m.isPaused = false;
    m.timerStartedAt = new Date();
    m.markModified('timerStartedAt');
  } else if (action === 'pause') {
    if (m.isPaused) throw new HttpError(409, 'Timer is already paused.');
    const elapsed = Math.floor((Date.now() - new Date(m.timerStartedAt).getTime()) / 1000);
    m.timeRemaining = Math.max(0, m.timeRemaining - elapsed);
    m.isPaused = true;
    m.timerStartedAt = null;
  } else if (action === 'set_duration') {
    // Admin sets half duration (e.g. 15 min or 20 min or custom)
    const newDuration = halfDurationMinutes ? Math.max(60, Number(halfDurationMinutes) * 60) : Math.max(60, Number(halfDuration));
    if (!newDuration || isNaN(newDuration)) throw new HttpError(400, 'Invalid duration.');
    const oldDuration = m.halfDuration || 900;
    m.halfDuration = newDuration;

    // If timer is paused or requested to reset, align timeRemaining
    if (resetTimeRemaining || (m.isPaused && (m.timeRemaining === oldDuration || m.timeRemaining === undefined))) {
      m.timeRemaining = newDuration;
      m.timerStartedAt = null;
    } else {
      if (!m.isPaused && m.timerStartedAt) {
        const elapsed = Math.floor((Date.now() - new Date(m.timerStartedAt).getTime()) / 1000);
        m.timeRemaining = Math.max(0, m.timeRemaining - elapsed);
        m.timerStartedAt = new Date();
      }
      m.timeRemaining = Math.min(m.timeRemaining, newDuration);
    }
    m.log.push({ text: `⏱ Half duration updated to ${Math.round(newDuration / 60)} minutes.` });
  } else if (action === 'adjust_time') {
    // Add/subtract delta (in seconds, e.g. +60 or -60) or set exact timeRemaining
    if (delta !== undefined) {
      if (!m.isPaused && m.timerStartedAt) {
        const elapsed = Math.floor((Date.now() - new Date(m.timerStartedAt).getTime()) / 1000);
        m.timeRemaining = Math.max(0, m.timeRemaining - elapsed);
        m.timerStartedAt = new Date();
      }
      m.timeRemaining = Math.max(0, Math.min(m.halfDuration, m.timeRemaining + Number(delta)));
    } else if (timeRemaining !== undefined) {
      m.timeRemaining = Math.max(0, Math.min(m.halfDuration, Number(timeRemaining)));
      if (!m.isPaused) {
        m.timerStartedAt = new Date();
      }
    }
    m.log.push({ text: `⏱ Timer adjusted. Remaining: ${Math.floor(m.timeRemaining / 60)}m ${m.timeRemaining % 60}s.` });
  } else if (action === 'reset_half') {
    m.timeRemaining = m.halfDuration;
    m.isPaused = true;
    m.timerStartedAt = null;
    m.log.push({ text: `⏱ Timer reset to full half duration (${Math.round(m.halfDuration / 60)}m).` });
  } else {
    throw new HttpError(400, 'Invalid action. Use start, pause, resume, set_duration, adjust_time, or reset_half.');
  }
  await m.save();
  const json = (await getOr404(m._id)).toJSON();
  emitMatch(json, { effects: [{ type: 'TIMER_UPDATE' }] });
  res.json(json);
});

export const switchHalf = asyncHandler(async (req, res) => {
  const m = await Match.findById(req.params.id);
  if (!m) throw new HttpError(404, 'Match not found.');
  if (m.status !== 'live') throw new HttpError(409, 'This match is not live.');
  if (m.half !== 1) throw new HttpError(409, 'Already in the second half.');
  
  // Save halftime scores
  m.halfTimeScoreA = m.scoreA;
  m.halfTimeScoreB = m.scoreB;
  m.half = 2;
  m.timeRemaining = m.halfDuration;
  m.isPaused = true;
  m.timerStartedAt = null;
  
  // Swap raiding team for second half
  if (m.state) {
    m.state.raiding = 1 - m.state.raiding;
    m.markModified('state');
  }
  
  m.log.push({ text: `Half time. Score: ${m.scoreA} - ${m.scoreB}` });
  await m.save();
  const json = (await getOr404(m._id)).toJSON();
  emitMatch(json, { effects: [{ type: 'HALF_TIME' }] });
  res.json(json);
});
