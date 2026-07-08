# Ollama Chat

A chat application that connects to a local Ollama model. Features real-time streaming responses, message history, loading indicators, and a clear chat button.

## Prerequisites

You need [Ollama](https://ollama.com/) installed and running locally with at least one model pulled.

```bash
# install ollama, then pull a model
ollama pull llama3
```

## Setup

```bash
cd ollama-chat
npm install
node server.js
```

Then open `http://localhost:3010` in your browser.

## Features

- Real-time token-by-token streaming (SSE)
- Message history (full conversation context sent to model)
- Loading indicator while AI is thinking
- Clear chat button to reset conversation
- Model selector (auto-detects installed models)
- Responsive dark theme UI
- Shift+Enter for multiline input

## Tech

- Node.js, Express
- Ollama REST API
- Server-Sent Events for streaming
- HTML, CSS, JavaScript
