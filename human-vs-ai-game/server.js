/**
 * @fileoverview Human vs AI Detector Game Backend Server
 * 
 * This module configures an Express.js server to serve the static frontend assets
 * and provides a RESTful API to manage the global leaderboard.
 */

const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse incoming JSON payloads and serve static frontend files
app.use(express.json());
app.use(express.static('public'));

/**
 * In-memory data store for the leaderboard.
 * Note: For a production environment, this should be replaced with a persistent database (e.g., PostgreSQL or MongoDB).
 * @type {Array<{name: string, score: number}>}
 */
let leaderboard = [
    { name: 'AI Overlord', score: 9999 },
    { name: 'Turing Test Champ', score: 850 },
    { name: 'Human Bean', score: 500 }
];

/**
 * @route GET /api/leaderboard
 * @description Retrieves the top 10 highest scores from the leaderboard.
 * @returns {Array<{name: string, score: number}>} JSON array of top scores.
 */
app.get('/api/leaderboard', (req, res) => {
    const topScores = leaderboard
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
    res.json(topScores);
});

/**
 * @route POST /api/leaderboard
 * @description Submits a new player score to the leaderboard.
 * @param {Object} req.body - The payload containing player name and score.
 * @param {string} req.body.name - The player's display name.
 * @param {number} req.body.score - The player's final score.
 * @returns {Array<{name: string, score: number}>} Updated JSON array of top scores.
 */
app.post('/api/leaderboard', (req, res) => {
    const { name, score } = req.body;
    
    // Validate the incoming payload to prevent malformed data
    if (!name || typeof score !== 'number') {
        return res.status(400).json({ error: 'Invalid score payload. Name and score are required.' });
    }

    // Sanitize the input and record the score
    leaderboard.push({ name: name.trim(), score });
    
    // Recalculate and return the updated top 10 leaderboard
    const topScores = leaderboard
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
        
    res.json(topScores);
});

/**
 * Initializes the Express server on the designated port.
 */
app.listen(port, () => {
    console.log(`🚀 Human vs AI Game Server running at http://localhost:${port}`);
});
