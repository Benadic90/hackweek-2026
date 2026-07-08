const express = require('express');
const path = require('path');
const fs = require('fs');

// Import our task modules
const searchGoogle = require('./tasks/searchGoogle');
const screenshotPage = require('./tasks/screenshotPage');
const extractData = require('./tasks/extractData');
const fillForm = require('./tasks/fillForm');
const wikiLookup = require('./tasks/wikiLookup');

const app = express();
app.use(express.json());

// Serve the frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Serve the screenshots folder so the UI can display them
app.use('/screenshots', express.static(path.join(__dirname, 'screenshots')));

// Make sure the screenshots folder exists
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir);

/**
 * We use Server-Sent Events (SSE) to stream real-time logs
 * back to the browser as the agent works. This gives the user
 * a live "terminal" experience showing exactly what the agent
 * is doing step by step.
 */
app.get('/api/run', async (req, res) => {
  const task = req.query.task;
  const input = req.query.input || '';

  // Set up the SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // This callback sends real-time log messages to the frontend
  const sendLog = (message) => {
    res.write(`data: ${JSON.stringify({ type: 'log', message })}\n\n`);
  };

  try {
    let result;

    // Route to the correct task module based on user selection
    switch (task) {
      case 'search':
        sendLog(`Starting Google Search task for: "${input}"`);
        result = await searchGoogle(input, sendLog);
        break;

      case 'screenshot':
        sendLog(`Starting Screenshot task for: ${input}`);
        result = await screenshotPage(input, sendLog);
        break;

      case 'extract':
        sendLog(`Starting Data Extraction task for: ${input}`);
        result = await extractData(input, sendLog);
        break;

      case 'form':
        sendLog('Starting Auto Form Filler task...');
        result = await fillForm(sendLog);
        break;

      case 'wiki':
        sendLog(`Starting Wikipedia Lookup for: "${input}"`);
        result = await wikiLookup(input, sendLog);
        break;

      default:
        sendLog('Error: Unknown task type.');
        result = { error: 'Unknown task' };
    }

    // Send the final result as the last SSE event
    res.write(`data: ${JSON.stringify({ type: 'result', data: result })}\n\n`);

  } catch (error) {
    sendLog(`Error: ${error.message}`);
    res.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`);
  }

  res.end();
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Browser Agent running at http://localhost:${PORT}`);
});
