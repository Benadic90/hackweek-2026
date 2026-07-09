// Load env vars from .env file (super important for docker-compose)
require('dotenv').config();
const express = require('express');

const app = express();

// Grab config from environment, fallback to defaults for local dev
const PORT = process.env.PORT || 3000;
const APP_NAME = process.env.APP_NAME || 'Dockerized App';
const ENVIRONMENT = process.env.NODE_ENV || 'development';

// Just a simple route to prove the container is alive and mapped correctly
app.get('/', (req, res) => {
    // keeping the HTML inline here so we don't have to mess with static folders for this demo
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${APP_NAME}</title>
            <style>
                /* Quick and dirty styling to make it look decent */
                body {
                    font-family: 'Segoe UI', Tahoma, sans-serif;
                    background: #0f172a;
                    color: #f8fafc;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    margin: 0;
                }
                .container {
                    background: #1e293b;
                    padding: 3rem;
                    border-radius: 12px;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
                    text-align: center;
                    border: 1px solid #334155;
                }
                h1 { color: #38bdf8; margin-top: 0; }
                .badge {
                    background: #0ea5e9;
                    color: white;
                    padding: 4px 12px;
                    border-radius: 999px;
                    font-size: 0.8rem;
                    font-weight: bold;
                }
                p { color: #cbd5e1; line-height: 1.6; }
                .docker-icon { font-size: 4rem; margin-bottom: 1rem; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="docker-icon">🐳</div>
                <h1>${APP_NAME}</h1>
                <p>Status: <span class="badge">Running Perfectly</span></p>
                <p>Environment: <strong>${ENVIRONMENT}</strong></p>
                <p>If you're seeing this, the Docker container port mapping worked!</p>
            </div>
        </body>
        </html>
    `);
});

// Kick off the server
app.listen(PORT, () => {
    console.log(`🐳 [${ENVIRONMENT}] ${APP_NAME} is listening on port ${PORT}...`);
});
