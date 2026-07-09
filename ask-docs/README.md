# Ask Your Documents (Local RAG)

A fully autonomous, 100% local Document Question Answering System. This project demonstrates a complete Retrieval-Augmented Generation (RAG) pipeline running entirely on your machine—meaning zero cloud API keys, zero subscription costs, and maximum privacy.

## Features Included

- **Document Parsing:** Automatically extracts text from uploaded PDF and TXT files.
- **Text Chunking:** Intelligently splits long documents into overlapping contextual chunks.
- **Local Embeddings:** Uses HuggingFace's `Transformers.js` to run a lightweight, high-performance embedding model (`Xenova/all-MiniLM-L6-v2`) entirely within the Node.js runtime.
- **Vector Database:** Implements a custom in-memory vector store utilizing Cosine Similarity to rank and retrieve the most relevant chunks.
- **RAG & LLM Generation:** Sends the retrieved context securely to your local **Ollama** instance to generate a highly accurate, context-aware answer. Streams the output to a beautiful UI.

## Setup Instructions

### Prerequisites
1. **Node.js** installed on your system.
2. **Ollama** installed locally (download from [ollama.com](https://ollama.com)).

### Installation
1. Pull the `llama3` model for Ollama if you haven't already:
   ```bash
   ollama pull llama3
   ```
2. Navigate to this directory and install dependencies:
   ```bash
   cd ask-docs
   npm install
   ```
3. Start the application:
   ```bash
   npm start
   ```
4. Open your browser to `http://localhost:3020`.

## How to Use
1. **Upload:** Drag and drop your PDFs or text files into the sidebar upload zone. The backend will parse, chunk, and embed the text locally.
2. **Ask:** Type a question in the chat interface. The system will retrieve the 3 most relevant chunks from the vector database and stream an answer via Ollama.
3. **Verify:** The AI will attach a "Sources" badge to its answers so you know exactly which documents it cited!
