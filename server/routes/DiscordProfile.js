const express = require('express');
const axios = require('axios');
const DiscordProfile = require('../models/DiscordProfileModel');

const router = express.Router();

async function fetchDiscordProfile(discordUserId) {
  try {
    const botToken = process.env.DISCORD_BOT_TOKEN;
    const headers = {
      Authorization: `Bot ${botToken}`,
    };

    // Fetch the profile of the user with the given user ID
    const response = await axios.get(`https://discord.com/api/v9/users/${discordUserId}`, {
      headers,
    });

    return response.data;
  } catch (error) {
    console.error('Discord API Error:', error.message);
    return null;
  }
}

// API endpoint to fetch Discord profile data and store it in MongoDB
router.post('/fetch-discord-profile', async (req, res) => {
    const { discordUserId } = req.body;
  
    try {
      // Check if the profile already exists in the database
      const existingProfile = await DiscordProfile.findOne({ id: discordUserId });
      if (existingProfile) {
        console.log('Profile already exists in the database.');
        return res.sendStatus(200); // Respond with a success status
      }
    } catch (error) {
      console.error('Error checking existing profile:', error.message);
      return res.sendStatus(500); // Respond with an error status
    }
  

  // Fetch the profile from Discord
  const discordProfile = await fetchDiscordProfile(discordUserId);


  if (discordProfile) {
    // Extract the fields to store in the new collection
    const {
      username,
      discriminator,
      id,
      avatar,
      bio,
      // Add any other properties you want to store here
      // For example:
      // email,
      // premium_since,
    } = discordProfile;

    // Create a new document for the DiscordProfile model
    const newDiscordProfile = new DiscordProfile({
      username,
      discriminator,
      id,
      avatar,
      bio,
      // Add any other fields you want to store here
      // For example:
      // email,
      // premiumSince,
    });

      

    // Save the new document to MongoDB
    try {
      await newDiscordProfile.save();
      console.log('Details fetched and stored successfully.');
      return res.sendStatus(200); // Respond with a success status
    } catch (error) {
      console.error('Error saving Discord profile:', error.message);
      return res.sendStatus(500); // Respond with an error status
    }
  } else {
    return res.status(404).json({ error: 'Discord profile not found.' });
  }
});

module.exports = router;
