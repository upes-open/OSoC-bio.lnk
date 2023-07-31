// routes/TwitterProfile.js
const express = require('express');
const Twitter = require('twitter-lite');
const TwitterProfile = require('../models/TwitterProfileModel');
require('dotenv').config();

const router = express.Router();

async function fetchTwitterProfile(username) {
    const client = new Twitter({
      subdomain: 'api',
      version: '2',
      consumer_key: process.env.TWITTER_API_KEY,
      consumer_secret: process.env.TWITTER_API_SECRET_KEY,
      access_token_key: process.env.TWITTER_ACCESS_TOKEN,
      access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    });
  
    try {
      console.log(`Fetching Twitter profile for: ${username}`);
      const user = await client.get(`users/by/username/${username}`);
      console.log('Twitter API Response:', user.data);
      return user.data;
    } catch (error) {
      console.error('Twitter API Error:', error);
      return null;
    }
  }

// API endpoint to fetch Twitter profile data and store it in MongoDB
router.post('/fetch-twitter-profile', async (req, res) => {
  const { twitter } = req.body;

  // Check if the profile already exists in the database
  try {
    const existingProfile = await TwitterProfile.findOne({ username: twitter });
    if (existingProfile) {
      console.log('Profile already exists in the database.');
      return res.sendStatus(200); // Respond with a success status
    }
  } catch (error) {
    console.error('Error checking existing profile:', error.message);
    return res.sendStatus(500); // Respond with an error status
  }

  // If the profile doesn't exist in the database, fetch it from Twitter
  const twitterProfile = await fetchTwitterProfile(twitter);

  if (twitterProfile) {
    // Extract the fields to store in the new collection
    const { profile_image_url, name, id, description, followers_count, friends_count } = twitterProfile;

    // Create a new document for the TwitterProfile model
    const newTwitterProfile = new TwitterProfile({
      profile_image_url,
      username: name,
      id: id_str,
      description,
      following: friends_count,
      followers: followers_count,
    });

    // Save the new document to MongoDB
    try {
      await newTwitterProfile.save();
      console.log('Details fetched and stored successfully.');
      return res.sendStatus(200); // Respond with a success status
    } catch (error) {
      console.error('Error saving Twitter profile:', error.message);
      return res.sendStatus(500); // Respond with an error status
    }
  } else {
    return res.status(404).json({ error: 'Twitter profile not found.' });
  }
});

module.exports = router;
