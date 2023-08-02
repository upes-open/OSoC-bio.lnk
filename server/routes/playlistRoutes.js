// routes/playlistRoutes.js

const express = require("express");
const router = express.Router();
const axios = require("axios");
const Playlist = require("../models/playlist"); // Import the Playlist model
require("dotenv").config();

const spotifyClientId = process.env.SPOTIFY_CLIENT_ID;
const spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const spotifyAuthEndpoint = "https://accounts.spotify.com/api/token";
const spotifyApiBaseUrl = "https://api.spotify.com/v1";

// Helper function to extract playlist ID from the link
function getPlaylistIdFromLink(playlistLink) {
  const playlistIdMatch = playlistLink.match(/playlist\/([\w\d]+)/);
  return playlistIdMatch ? playlistIdMatch[1] : null;
}

// Function to get an access token using the Client Credentials Flow
async function getAccessToken() {
  const authString = Buffer.from(`${spotifyClientId}:${spotifyClientSecret}`).toString("base64");
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    Authorization: `Basic ${authString}`,
  };
  const data = "grant_type=client_credentials";
  const response = await axios.post(spotifyAuthEndpoint, data, { headers });
  return response.data.access_token;
}

// Function to fetch playlist details from Spotify API using the access token
async function fetchPlaylistDetails(playlistLink) {
  try {
    const playlistId = getPlaylistIdFromLink(playlistLink);
    if (!playlistId) {
      throw new Error("Invalid playlist link.");
    }

    const accessToken = await getAccessToken();
    const spotifyApiUrl = `${spotifyApiBaseUrl}/playlists/${playlistId}`;
    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };
    const response = await axios.get(spotifyApiUrl, { headers });
    return response.data;
  } catch (error) {
    console.error("Error fetching playlist details:", error.message);
    throw error;
  }
}
router.post("/getPlaylistDetails", async (req, res) => {
  try {
    const { playlistLink } = req.body;
    const playlistData = await fetchPlaylistDetails(playlistLink);

    // Extract required fields from the playlistData
    const { id, name, description, images } = playlistData;
    const coverImageUrl = images[0]?.url || null;

    // Create a new playlist document using the Playlist model
    const playlist = new Playlist({
      playlistId: id, // Set the playlistId field to the Spotify id
      name,
      description,
      coverImageUrl,
      // Add other fields as needed for playlist details
    });

    // Save the playlist document to the database
    await playlist.save();

    res.status(200).json({ message: "Playlist added successfully!", playlist: playlistData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
