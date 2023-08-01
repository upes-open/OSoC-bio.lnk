// models/playlist.js

const mongoose = require("mongoose");

const playlistSchema = new mongoose.Schema({
  playlistId: { type: String, required: true, unique: true }, // Make it unique
  name: { type: String, required: true },
  description: { type: String },
  coverImageUrl: { type: String, required: true },
  // Add other fields as needed for playlist details
});

const Playlist = mongoose.model("Playlist", playlistSchema);

module.exports = Playlist;
