require('dotenv').config();
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;
const APP_NAME = process.env.APP_NAME || 'Dockerized App';
const ENVIRONMENT = process.env.NODE_ENV || 'development';

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${APP_NAME}</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
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
                    text-transform: uppercase;
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
                <p>This application is securely running inside an isolated Docker container!</p>
            </div>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`🐳 ${APP_NAME} running in ${ENVIRONMENT} mode on port ${PORT}`);
});
