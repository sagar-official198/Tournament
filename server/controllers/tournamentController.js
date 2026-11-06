import mongoose from 'mongoose';
import Tournament from '../models/Tournament.js';
import Team from '../models/Team.js';
import Match from '../models/Match.js';
import { buildBracket } from '../utils/bracket.js';
import { populateMatch } from '../services/matchService.js';
import { emitBracket, emitDisplay, emitTournament } from '../services/realtime.js';
import { asyncHandler, HttpError } from '../utils/asyncHandler.js';

export const currentTournament = asyncHandler(async (req, res) => {
  const t = await Tournament.findOne()
    .sort({ createdAt: -1 })
    .populate('champion', 'name logo village')
    .populate('runnerUp', 'name logo village')
    .populate('thirdPlaceTeam', 'name logo village');
  res.json(t); // null when nothing is created yet
});

export const createTournament = asyncHandler(async (req, res) => {
  const { name, year, organizer, members, prizeMoney, awards, matchRules } = req.body;
  const t = await Tournament.create({ name, year, organizer, members, prizeMoney, awards, matchRules });
  emitTournament(t);
  res.status(201).json(t);
});

export const updateTournament = asyncHandler(async (req, res) => {
  const t = await Tournament.findById(req.params.id);
  if (!t) throw new HttpError(404, 'Tournament not found.');
  const { name, year, organizer, members, prizeMoney, awards, displayConfig, matchRules } = req.body;
  if (name !== undefined) t.name = name;
  if (year !== undefined) t.year = year;
  if (organizer !== undefined) {
    t.organizer = organizer;
    t.markModified('organizer');
  }
  if (members !== undefined) {
    t.members = members;
    t.markModified('members');
  }
  if (prizeMoney !== undefined) {
    t.prizeMoney = prizeMoney;
    t.markModified('prizeMoney');
  }
  if (awards !== undefined) {
    t.awards = awards;
    t.markModified('awards');
  }
  if (matchRules !== undefined) {
    t.matchRules = { ...(t.matchRules || {}), ...matchRules };
    t.markModified('matchRules');
  }
  if (displayConfig !== undefined) {
    t.displayConfig = { ...(t.displayConfig?.toObject?.() || {}), ...displayConfig };
    emitDisplay(t._id, t.displayConfig);
  }
  await t.save();
  emitTournament(t);
  res.json(t);
});

export const updateDisplay = asyncHandler(async (req, res) => {
  const t = await Tournament.findById(req.params.id);
  if (!t) throw new HttpError(404, 'Tournament not found.');
  t.displayConfig = {
    ...(t.displayConfig?.toObject?.() || {}),
    ...req.body,
  };
  await t.save();
  emitDisplay(t._id, t.displayConfig);
  res.json(t.displayConfig);
});

export const tournamentMatches = asyncHandler(async (req, res) => {
  const matches = await populateMatch(
    Match.find({ tournament: req.params.id }).sort({ round: 1, matchNumber: 1 })
  );
  res.json(matches);
});

// Make the knockout bracket from the chosen teams.
export const drawTournament = asyncHandler(async (req, res) => {
  const t = await Tournament.findById(req.params.id);
  if (!t) throw new HttpError(404, 'Tournament not found.');

  const started = await Match.exists({ tournament: t._id, bye: false, status: { $in: ['live', 'finished'] } });
  if (started && !req.body.force) {
    throw new HttpError(409, 'Matches have already started. Draw again only if you are sure (force).');
  }

  const teamIds = [...new Set((req.body.teamIds || []).map(String))];
  const found = await Team.countDocuments({ _id: { $in: teamIds } });
  if (found !== teamIds.length) throw new HttpError(400, 'One of the chosen teams does not exist.');

  let bracket;
  try {
    bracket = buildBracket(teamIds, { shuffleTeams: req.body.shuffle !== false, includeThirdPlace: true });
  } catch (e) {
    throw new HttpError(400, e.message);
  }

  await Match.deleteMany({ tournament: t._id });
  const ids = bracket.matches.map(() => new mongoose.Types.ObjectId());
  const docs = bracket.matches.map((m, i) => ({
    _id: ids[i],
    tournament: t._id,
    round: m.round,
    matchNumber: m.matchNumber,
    teamA: m.teamA,
    teamB: m.teamB,
    bye: m.bye,
    winner: m.winner,
    status: m.bye ? 'finished' : m.teamA && m.teamB ? 'upcoming' : 'waiting',
    nextMatch: m.nextIndex === null ? null : ids[m.nextIndex],
    nextSlot: m.nextSlot,
    isThirdPlace: Boolean(m.isThirdPlace),
    label: m.label || '',
  }));
  await Match.insertMany(docs);

  t.teams = teamIds;
  t.rounds = bracket.rounds;
  t.status = 'ongoing';
  t.champion = null;
  t.runnerUp = null;
  t.thirdPlaceTeam = null;
  await t.save();

  emitBracket(t._id);
  const matches = await populateMatch(Match.find({ tournament: t._id }).sort({ round: 1, matchNumber: 1 }));
  res.status(201).json({ tournament: t, matches });
});
