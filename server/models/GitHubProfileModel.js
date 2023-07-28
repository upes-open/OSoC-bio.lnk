// models/GitHubProfileModel.js
const mongoose = require('mongoose');

const gitHubProfileSchema = new mongoose.Schema({
  avatar_url: String,
  username: String,
  id: Number,
  bio: String,
  following: Number,
  followers: Number,
});

const GitHubProfile = mongoose.model('GitHubProfile', gitHubProfileSchema);

module.exports = GitHubProfile;
