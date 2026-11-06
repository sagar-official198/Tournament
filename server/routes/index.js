import { Router } from 'express';
import { requireScorerKey as key } from '../middleware/scorerKey.js';
import { imageUpload } from '../middleware/upload.js';
import * as team from '../controllers/teamController.js';
import * as player from '../controllers/playerController.js';
import * as tournament from '../controllers/tournamentController.js';
import * as match from '../controllers/matchController.js';
import { uploadImage } from '../controllers/uploadController.js';

const router = Router();

router.get('/health', (req, res) => res.json({ ok: true }));
router.get('/auth/check', key, (req, res) => res.json({ ok: true }));

// teams and players
router.get('/teams', team.listTeams);
router.get('/teams/:id', team.getTeam);
router.post('/teams', key, team.createTeam);
router.put('/teams/:id', key, team.updateTeam);
router.put('/teams/:id/captain', key, team.setCaptain);
router.delete('/teams/:id', key, team.deleteTeam);
router.post('/teams/:teamId/players', key, player.addPlayer);
router.put('/players/:id', key, player.updatePlayer);
router.delete('/players/:id', key, player.deletePlayer);

// tournament and bracket
router.get('/tournaments/current', tournament.currentTournament);
router.get('/tournaments/:id/matches', tournament.tournamentMatches);
router.post('/tournaments', key, tournament.createTournament);
router.post('/tournaments/:id/draw', key, tournament.drawTournament);
router.put('/tournaments/:id', key, tournament.updateTournament);
router.put('/tournaments/:id/display', key, tournament.updateDisplay);

// matches and live scoring
router.get('/matches/live', match.liveMatches);
router.get('/matches/:id', match.getMatch);
router.put('/matches/:id/schedule', key, match.scheduleMatch);
router.post('/matches/:id/start', key, match.startMatch);
router.post('/matches/:id/event', key, match.addEvent);
router.post('/matches/:id/undo', key, match.undoEvent);
router.post('/matches/:id/finish', key, match.finishMatch);
router.post('/matches/:id/timer', key, match.timerControl);
router.post('/matches/:id/half', key, match.switchHalf);

// photos
router.post('/upload', key, imageUpload, uploadImage);

export default router;
