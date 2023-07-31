const mongoose = require('mongoose');

const discordProfileSchema = new mongoose.Schema({
    username: String,
    discriminator: String,
    id: String,
    avatar: String,
    bio: String,
  });


const DiscordProfile = mongoose.model('DiscordProfile', discordProfileSchema);

module.exports = DiscordProfile;
