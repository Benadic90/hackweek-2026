const express = require('express');
const path = require('path');
const http = require('http');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';

// proxy chat requests to ollama with streaming
app.post('/api/chat', async (req, res) => {
  const { messages, model } = req.body;

  // set up SSE so we can stream the response token by token
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const payload = JSON.stringify({
    model: model || 'llama3',
    messages: messages,
    stream: true
  });

  const url = new URL(OLLAMA_HOST + '/api/chat');

  const options = {
    hostname: url.hostname,
    port: url.port,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  const ollamaReq = http.request(options, (ollamaRes) => {
    let buffer = '';

    ollamaRes.on('data', (chunk) => {
      buffer += chunk.toString();
      // ollama sends newline-delimited JSON
      let lines = buffer.split('\n');
      buffer = lines.pop(); // keep incomplete line in buffer

      for (let line of lines) {
        if (!line.trim()) continue;
        try {
          let data = JSON.parse(line);
          if (data.message && data.message.content) {
            res.write(`data: ${JSON.stringify({ token: data.message.content })}\n\n`);
          }
          if (data.done) {
            res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
          }
        } catch (e) {
          // skip malformed json chunks
        }
      }
    });

    ollamaRes.on('end', () => {
      // process remaining buffer
      if (buffer.trim()) {
        try {
          let data = JSON.parse(buffer);
          if (data.message && data.message.content) {
            res.write(`data: ${JSON.stringify({ token: data.message.content })}\n\n`);
          }
        } catch (e) {}
      }
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    });

    ollamaRes.on('error', (err) => {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    });
  });

  ollamaReq.on('error', (err) => {
    res.write(`data: ${JSON.stringify({ error: 'Cannot connect to Ollama. Make sure Ollama is running on ' + OLLAMA_HOST })}\n\n`);
    res.end();
  });

  ollamaReq.write(payload);
  ollamaReq.end();
});

// check which models are available
app.get('/api/models', async (req, res) => {
  const url = new URL(OLLAMA_HOST + '/api/tags');

  http.get(url, (ollamaRes) => {
    let data = '';
    ollamaRes.on('data', chunk => data += chunk);
    ollamaRes.on('end', () => {
      try {
        let parsed = JSON.parse(data);
        let models = (parsed.models || []).map(m => m.name);
        res.json({ models });
      } catch (e) {
        res.json({ models: [], error: 'Failed to parse models' });
      }
    });
  }).on('error', () => {
    res.json({ models: [], error: 'Ollama not running' });
  });
});

const PORT = process.env.PORT || 3010;
app.listen(PORT, () => {
  console.log(`Ollama Chat running at http://localhost:${PORT}`);
});
