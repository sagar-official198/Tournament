import Team from '../models/Team.js';
import Player from '../models/Player.js';
import Tournament from '../models/Tournament.js';
import { asyncHandler, HttpError } from '../utils/asyncHandler.js';

const PLAYER_FIELDS = 'name photo jerseyNo role age team';
const pick = (body) => {
  const out = {};
  for (const k of ['name', 'village', 'logo', 'teamPhoto']) if (body[k] !== undefined) out[k] = body[k];
  return out;
};

export const listTeams = asyncHandler(async (req, res) => {
  const teams = await Team.find().sort({ name: 1 }).populate('captain', 'name photo');
  res.json(teams);
});

export const getTeam = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id)
    .populate('captain', 'name photo')
    .populate({ path: 'players', select: PLAYER_FIELDS, options: { sort: { jerseyNo: 1, name: 1 } } });
  if (!team) throw new HttpError(404, 'Team not found.');
  res.json(team);
});

export const createTeam = asyncHandler(async (req, res) => {
  const team = await Team.create(pick(req.body));
  res.status(201).json(team);
});

export const updateTeam = asyncHandler(async (req, res) => {
  const team = await Team.findByIdAndUpdate(req.params.id, pick(req.body), { new: true, runValidators: true });
  if (!team) throw new HttpError(404, 'Team not found.');
  res.json(team);
});

export const setCaptain = asyncHandler(async (req, res) => {
  const { playerId } = req.body;
  const player = playerId ? await Player.findOne({ _id: playerId, team: req.params.id }) : null;
  if (playerId && !player) throw new HttpError(400, 'That player is not in this team.');
  const team = await Team.findByIdAndUpdate(req.params.id, { captain: player ? player._id : null }, { new: true });
  if (!team) throw new HttpError(404, 'Team not found.');
  res.json(team);
});

export const deleteTeam = asyncHandler(async (req, res) => {
  const busy = await Tournament.exists({ teams: req.params.id, status: 'ongoing' });
  if (busy) throw new HttpError(409, 'This team is in a running tournament and cannot be deleted.');
  const team = await Team.findByIdAndDelete(req.params.id);
  if (!team) throw new HttpError(404, 'Team not found.');
  await Player.deleteMany({ team: team._id });
  res.json({ message: 'Team deleted.' });
});
