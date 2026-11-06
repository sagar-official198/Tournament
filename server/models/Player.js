import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    photo: { type: String, default: '' },
    jerseyNo: { type: Number, min: 0, max: 999 },
    role: { type: String, enum: ['raider', 'defender', 'all-rounder'], default: 'all-rounder' },
    age: { type: Number, min: 5, max: 70 },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true, index: true },
  },
  { timestamps: true }
);

export default mongoose.model('Player', playerSchema);
