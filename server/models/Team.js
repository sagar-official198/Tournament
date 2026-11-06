import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    village: { type: String, trim: true, maxlength: 60, default: '' },
    logo: { type: String, default: '' },
    teamPhoto: { type: String, default: '' },
    captain: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', default: null },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

teamSchema.virtual('players', {
  ref: 'Player',
  localField: '_id',
  foreignField: 'team',
});

export default mongoose.model('Team', teamSchema);
