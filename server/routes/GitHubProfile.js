// routes/GitHubProfile.js
const express = require('express');
const axios = require('axios');
const GitHubProfile = require('../models/GitHubProfileModel'); // Import the Mongoose model

const router = express.Router();

async function fetchGithubProfile(username) {
  try {
    const response = await axios.get(`https://api.github.com/users/${username}`);
    return response.data;
  } catch (error) {
    console.error('GitHub API Error:', error.message);
    return null;
  }
}

// API endpoint to fetch GitHub profile data and store it in MongoDB
router.post('/fetch-profile', async (req, res) => {
  const { github } = req.body;

  // Check if the profile already exists in the database
  try {
    const existingProfile = await GitHubProfile.findOne({ username: github });
    if (existingProfile) {
      console.log('Profile already exists in the database.');
      return res.sendStatus(200); // Respond with a success status
    }
  } catch (error) {
    console.error('Error checking existing profile:', error.message);
    return res.sendStatus(500); // Respond with an error status
  }

  // If the profile doesn't exist in the database, fetch it from GitHub
  const githubProfile = await fetchGithubProfile(github);

  if (githubProfile) {
    // Extract the fields to store in the new collection
    const { avatar_url, login, id, bio, following, followers } = githubProfile;

    // Create a new document for the GitHubProfile model
    const newGitHubProfile = new GitHubProfile({
      avatar_url,
      username: login,
      id,
      bio,
      following,
      followers,
    });

    // Save the new document to MongoDB
    try {
      await newGitHubProfile.save();
      console.log('Details fetched and stored successfully.');
      return res.sendStatus(200); // Respond with a success status
    } catch (error) {
      console.error('Error saving GitHub profile:', error.message);
      return res.sendStatus(500); // Respond with an error status
    }
  } else {
    return res.status(404).json({ error: 'GitHub profile not found.' });
  }
});

module.exports = router;
