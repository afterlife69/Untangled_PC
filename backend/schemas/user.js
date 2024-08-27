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
    calm: { type: Number, default: 0 },
    happy: { type: Number, default: 0 },
    sad: { type: Number, default: 0 },
    angry: { type: Number, default: 0 },
    fear: { type: Number, default: 0 },
    disgusted: { type: Number, default: 0 },
    surprised: { type: Number, default: 0 },
    confused: { type: Number, default: 0 },
  },
  recentStatistics: [
    {
      emotions: {
        calm: Number,
        happy: Number,
        sad: Number,
        angry: Number,
        fear: Number,
        disgusted: Number,
        surprised: Number,
        confused: Number,
      },
      prompt: String,
    }
  ],
});

export default mongoose.model('User', userSchema);

