import mongoose from 'mongoose';
import { RULES } from '../config/rules.js';
import { aliveCount } from '../utils/kabaddiEngine.js';

const logSchema = new mongoose.Schema(
  { text: String, at: { type: Date, default: Date.now } },
  { _id: false }
);

const matchSchema = new mongoose.Schema(
  {
    tournament: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true, index: true },
    round: { type: Number, required: true },
    matchNumber: { type: Number, required: true },
    teamA: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
    teamB: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
    scoreA: { type: Number, default: 0 },
    scoreB: { type: Number, default: 0 },
    // waiting = a team is still missing, upcoming = both known, live, finished
    status: { type: String, enum: ['waiting', 'upcoming', 'live', 'finished'], default: 'waiting' },
    winner: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
    bye: { type: Boolean, default: false },
    isThirdPlace: { type: Boolean, default: false },
    label: { type: String, default: '' },
    nextMatch: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', default: null },
    nextSlot: { type: String, enum: ['A', 'B', null], default: null },
    scheduledAt: { type: Date, default: null },
    ground: { type: String, trim: true, maxlength: 60, default: '' },
    // Timer and halves
    half: { type: Number, enum: [1, 2], default: 1 },
    halfDuration: { type: Number, default: 900 },
    timerStartedAt: { type: Date, default: null },
    timeRemaining: { type: Number, default: 900 },
    isPaused: { type: Boolean, default: true },
    halfTimeScoreA: { type: Number, default: null },
    halfTimeScoreB: { type: Number, default: null },
    // live scoring state (see utils/kabaddiEngine.js)
    state: { type: mongoose.Schema.Types.Mixed, default: null },
    log: { type: [logSchema], default: [] },
    // snapshots for undo, never sent to the browser
    history: { type: [mongoose.Schema.Types.Mixed], default: [], select: false },
  },
  { timestamps: true }
);

// Extra hints for the browser so it never has to know the rules itself.
matchSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    if (ret.state) {
      const R = ret.state.raiding;
      const D = 1 - R;
      const defenders = aliveCount(ret.state, D);
      ret.hints = {
        raidingTeam: R,
        doOrDieTeam: ret.state.empty[R] >= RULES.doOrDieAfter ? R : null,
        defenders,
        bonusLine: defenders >= RULES.bonusMinDefenders,
        superTackle: defenders <= RULES.superTackleMax,
      };
    }
    if (ret.half) {
      ret.timer = {
        half: ret.half,
        halfDuration: ret.halfDuration,
        timeRemaining: ret.timeRemaining,
        isPaused: ret.isPaused,
        timerStartedAt: ret.timerStartedAt,
        halfTimeScoreA: ret.halfTimeScoreA,
        halfTimeScoreB: ret.halfTimeScoreB,
      };
    }
    return ret;
  },
});

matchSchema.index({ tournament: 1, round: 1, matchNumber: 1 });

export default mongoose.model('Match', matchSchema);
