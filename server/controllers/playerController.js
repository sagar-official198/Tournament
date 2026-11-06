import Team from '../models/Team.js';
import Player from '../models/Player.js';
import { asyncHandler, HttpError } from '../utils/asyncHandler.js';

const pick = (body) => {
  const out = {};
  for (const k of ['name', 'photo', 'jerseyNo', 'role', 'age']) if (body[k] !== undefined) out[k] = body[k];
  return out;
};

export const addPlayer = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.teamId);
  if (!team) throw new HttpError(404, 'Team not found.');
  const player = await Player.create({ ...pick(req.body), team: team._id });
  res.status(201).json(player);
});

export const updatePlayer = asyncHandler(async (req, res) => {
  const player = await Player.findByIdAndUpdate(req.params.id, pick(req.body), { new: true, runValidators: true });
  if (!player) throw new HttpError(404, 'Player not found.');
  res.json(player);
});

export const deletePlayer = asyncHandler(async (req, res) => {
  const player = await Player.findByIdAndDelete(req.params.id);
  if (!player) throw new HttpError(404, 'Player not found.');
  await Team.updateOne({ _id: player.team, captain: player._id }, { captain: null });
  res.json({ message: 'Player removed.' });
});
