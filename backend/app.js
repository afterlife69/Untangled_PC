import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import { GoogleGenerativeAI } from "@google/generative-ai";
import User from './schemas/user.js';
import * as dotenv from 'dotenv';

dotenv.config();


const app = express();
app.use(bodyParser.json({ limit: '10mb' }));
app.use(cors());
const PORT = process.env.PORT || 8000;
mongoose.connect(process.env.MONGO_URL).then(() => {
  app.listen(PORT , () => {
    console.log('Connected');
  })
})
// Initialize Google AI

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: "you are a mental health professional and your name is untangled thoughts, you are provided with the user's current facial emotion and you want to help them feel better",
});


app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  const userExists = await User.findOne({ username });
  console.log(userExists)
  if (userExists) {
    res.status(200).json(1);
    return
  }
  const user = new User({ username, email, password, moodStatistics: {
    angry: 0,
    disgusted: 0,
    fearful: 0,
    happy: 0,
    neutral: 0,
    sad: 0,
    surprised: 0,
    calm: 0,
  }, recentStatistics: [] });
  try {
    // console.log('here')
    await user.save();
    res.status(200).json(0);
  } catch (error) {
    console.log(error)
    res.status(404).json('didnt work');
  }
})

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try{
    const user = await User.findOne({username})
    if(user){
      if(user.password == password){
        res.status(200).json(user);
      }
      else{
        res.status(200).json("wrong password");
      }
    }
    else{
      res.status(200).json("not found");
    }
  }
  catch{
    res.status(404).json(error);
  }
})

app.post('/chat', async (req, res) => {
  const { prompt } = req.body;
  try {
    // console.log(prompt)
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    res.status(200).json( text );
  } catch (error) {
    console.error('Error generating content:', error);
    res.status(500).json('Failed to generate content');
  }
});

app.post('/stats', async (req, res) => {
  const { emotionsObj, prompt, username } = req.body;
  try {
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(404).json('User not found');
    }
    const emotions = emotionsObj;
    // console.log(emotionsObj)
    
    for (let [key, value] of Object.entries(emotions)) {
      key = key.toLowerCase();
      if(!user.moodStatistics[key]){
        user.moodStatistics[key] = (value);
      }
      else
      {
        user.moodStatistics[key] += (value);
        user.moodStatistics[key] = user.moodStatistics[key] / 2;
      }
      emotions[key] = (value);
    }
    // console.log(user.moodStatistics)
    if (user.recentStatistics.length === 20) {
      user.recentStatistics.shift();
    }
    user.recentStatistics.push({ emotions, prompt });

    // Save the updated user document
    await user.save();

    res.status(200).json('Statistics updated successfully');
  } catch (error) {
    console.error('Error updating statistics:', error);
    res.status(500).json('Failed to update statistics');
  }
});

app.post('/getStats', async (req, res) => {
  const { username } = req.body;
  // console.log(username)
  try {
    const user = await User.findOne({
      username
    });
    if (!user) {
      return res.status(404).json('User not found');
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error getting statistics:', error);
    res.status(500).json('Failed to get statistics');
  }
} );