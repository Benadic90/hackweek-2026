const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON payloads and serve static frontend files
app.use(express.json());
app.use(express.static('public'));

// In-memory leaderboard store (persists as long as the server runs)
let leaderboard = [
    { name: 'AI Overlord', score: 9999 },
    { name: 'Turing Test Champ', score: 850 },
    { name: 'Human Bean', score: 500 }
];

/**
 * GET /api/leaderboard
 * Returns the top 10 players sorted by score in descending order.
 */
app.get('/api/leaderboard', (req, res) => {
    const topScores = leaderboard
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
    res.json(topScores);
});

/**
 * POST /api/leaderboard
 * Receives a new score payload { name, score } and adds it to the leaderboard.
 */
app.post('/api/leaderboard', (req, res) => {
    const { name, score } = req.body;
    
    if (!name || typeof score !== 'number') {
        return res.status(400).json({ error: 'Invalid score payload. Name and score are required.' });
    }

    // Add score and ensure it's recorded
    leaderboard.push({ name: name.trim(), score });
    
    // Send back the updated top 10
    const topScores = leaderboard
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
        
    res.json(topScores);
});

// Boot up the server
app.listen(port, () => {
    console.log(`🚀 Human vs AI Game Server running at http://localhost:${port}`);
});
