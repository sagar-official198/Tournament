import mongoose from 'mongoose';

const tournamentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    year: { type: Number, default: () => new Date().getFullYear() },
    status: { type: String, enum: ['draft', 'ongoing', 'completed'], default: 'draft' },
    teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
    rounds: { type: Number, default: 0 },
    champion: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
    runnerUp: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null }, // 2nd place (Final loser)
    thirdPlaceTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null }, // 3rd place (Playoff winner)
    // Organizer details
    organizer: {
      name: { type: String, trim: true, maxlength: 80, default: '' },
      phone: { type: String, trim: true, maxlength: 20, default: '' },
      village: { type: String, trim: true, maxlength: 80, default: '' },
      photo: { type: String, default: '' },
    },
    // Important members (array)
    members: [{
      name: { type: String, trim: true, maxlength: 80 },
      role: { type: String, trim: true, maxlength: 60 },
      phone: { type: String, trim: true, maxlength: 20, default: '' },
    }],
    // Prize money
    prizeMoney: {
      winner: { type: Number, default: 0 },
      runnerUp: { type: Number, default: 0 },
      thirdPlace: { type: Number, default: 0 },
      bestDefender: { type: Number, default: 0 },
      bestRaider: { type: Number, default: 0 },
    },
    // Special Awards for Best Raider and Best Defender
    awards: {
      isAnnounced: { type: Boolean, default: false },
      bestRaider: {
        playerName: { type: String, default: '', trim: true },
        teamName: { type: String, default: '', trim: true },
      },
      bestDefender: {
        playerName: { type: String, default: '', trim: true },
        teamName: { type: String, default: '', trim: true },
      },
    },
    // Match Timer & Game Rules Config (Admin can set 15m, 20m, etc.)
    matchRules: {
      halfDuration: { type: Number, default: 900 }, // 15 min default in seconds (900s or 1200s for 20m)
    },
    // Screen display control (Admin decides what to broadcast)
    displayConfig: {
      activeScreen: {
        type: String,
        enum: ['auto', 'live_match', 'results', 'bracket', 'welcome', 'teams', 'announcement', 'ceremony'],
        default: 'auto',
      },
      featuredMatch: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', default: null },
      announcement: { type: String, trim: true, maxlength: 200, default: '' },
      showPrizeMoney: { type: Boolean, default: true },
      showOrganizer: { type: Boolean, default: true },
      showMembers: { type: Boolean, default: true },
      showTicker: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export default mongoose.model('Tournament', tournamentSchema);
