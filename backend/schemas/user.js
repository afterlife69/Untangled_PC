import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  moodStatistics: {
    neutral: { type: Number, default: 0 },
    happy: { type: Number, default: 0 },
    sad: { type: Number, default: 0 },
    angry: { type: Number, default: 0 },
    fearful: { type: Number, default: 0 },
    disgusted: { type: Number, default: 0 },
    surprised: { type: Number, default: 0 },
  },
  recentStatistics: [
    {
      emotions: {
        neutral: Number,
        happy: Number,
        sad: Number,
        angry: Number,
        fearful: Number,
        disgusted: Number,
        surprised: Number,
      },
      prompt: String,
    }
  ],
});

export default mongoose.model('User', userSchema);

