// models/TwitterProfileModel.js
const mongoose = require('mongoose');

const twitterProfileSchema = new mongoose.Schema({
  profile_image_url: String,
  username: String,
  id: String,
  description: String,
  following: Number,
  followers: Number,
});

const TwitterProfile = mongoose.model('TwitterProfile', twitterProfileSchema);

module.exports = TwitterProfile;
