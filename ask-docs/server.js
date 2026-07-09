const express = require('express');
const helmet = require('helmet');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const path = require('path');
const http = require('http');

// Dynamic import of transformers.js (requires ES module import)
let pipeline;
(async () => {
    const Transformers = await import('@xenova/transformers');
    pipeline = Transformers.pipeline;
})();

const app = express();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false // disabled strictly for local demo to allow inline styles/scripts if needed
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Use memory storage for uploads to prevent disk exhaustion and path traversal vulnerabilities
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit per file
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf' || file.mimetype === 'text/plain') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF and TXT files are allowed.'));
        }
    }
});

// In-memory Vector Database
// Format: { id, text, embedding, docName }
let vectorStore = [];
let embeddingModel = null;

// Helper: Cosine Similarity
function cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Helper: Text Chunker (Splits by paragraphs, then overlaps)
function chunkText(text, chunkSize = 1000, overlap = 200) {
    // Clean up text
    const cleanText = text.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
    const chunks = [];
    let i = 0;
    while (i < cleanText.length) {
        let chunk = cleanText.substring(i, i + chunkSize);
        chunks.push(chunk);
        i += (chunkSize - overlap);
    }
    return chunks;
}

// Ensure the local embedding model is loaded
async function getEmbeddingModel() {
    if (!embeddingModel) {
        // Use a lightweight, fast, local embedding model
        embeddingModel = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
            quantized: true 
        });
    }
    return embeddingModel;
}

// Generate an embedding for a text string
async function generateEmbedding(text) {
    const extractor = await getEmbeddingModel();
    const output = await extractor(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data); // convert Float32Array to standard array
}

// API: Upload and process documents
app.post('/api/upload', upload.array('documents', 5), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded.' });
        }

        const processedDocs = [];

        for (const file of req.files) {
            let extractedText = '';

            // 1. Parse Document
            if (file.mimetype === 'application/pdf') {
                const pdfData = await pdfParse(file.buffer);
                extractedText = pdfData.text;
            } else if (file.mimetype === 'text/plain') {
                extractedText = file.buffer.toString('utf-8');
            }

            if (!extractedText.trim()) continue;

            // 2. Chunk Text
            const chunks = chunkText(extractedText);

            // 3. Generate Embeddings & Store
            for (const chunk of chunks) {
                const embedding = await generateEmbedding(chunk);
                vectorStore.push({
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                    text: chunk,
                    embedding: embedding,
                    docName: file.originalname
                });
            }
            
            processedDocs.push(file.originalname);
        }

        res.json({ success: true, message: `Successfully processed ${processedDocs.length} document(s).`, docs: processedDocs });
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ error: error.message || 'Failed to process documents.' });
    }
});

// API: Chat with RAG
app.post('/api/chat', async (req, res) => {
    const { question, model } = req.body;
    
    if (!question || typeof question !== 'string') {
        return res.status(400).json({ error: 'Invalid question format.' });
    }

    try {
        // 1. Embed the user's question
        const questionEmbedding = await generateEmbedding(question);

        // 2. Vector Search (Retrieve top 3 chunks)
        const scoredChunks = vectorStore.map(doc => {
            return {
                ...doc,
                score: cosineSimilarity(questionEmbedding, doc.embedding)
            };
        });

        // Sort by highest score
        scoredChunks.sort((a, b) => b.score - a.score);
        const topChunks = scoredChunks.slice(0, 3);

        // Build the context string
        let context = topChunks.map(c => `[Source: ${c.docName}]\n${c.text}`).join('\n\n');
        
        // Setup SSE for streaming response
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Create the RAG prompt
        const systemPrompt = `You are an intelligent document assistant. Use the provided Context to answer the User's Question. If the answer is not in the Context, politely say you don't know based on the documents provided. Do not use outside knowledge. Keep answers clear and concise.\n\nContext:\n${context}`;
        
        const payload = JSON.stringify({
            model: model || 'llama3',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: question }
            ],
            stream: true
        });

        // 3. Generate Answer using local Ollama instance
        const url = new URL('http://localhost:11434/api/chat');
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
                let lines = buffer.split('\n');
                buffer = lines.pop(); // keep incomplete line

                for (let line of lines) {
                    if (!line.trim()) continue;
                    try {
                        let data = JSON.parse(line);
                        if (data.message && data.message.content) {
                            res.write(`data: ${JSON.stringify({ token: data.message.content })}\n\n`);
                        }
                        if (data.done) {
                            // Send sources at the very end
                            const sources = Array.from(new Set(topChunks.map(c => c.docName)));
                            res.write(`data: ${JSON.stringify({ done: true, sources })}\n\n`);
                        }
                    } catch (e) {
                        // ignore malformed JSON chunks
                    }
                }
            });

            ollamaRes.on('end', () => {
                if (buffer.trim()) {
                    try {
                        let data = JSON.parse(buffer);
                        if (data.message && data.message.content) {
                            res.write(`data: ${JSON.stringify({ token: data.message.content })}\n\n`);
                        }
                    } catch (e) {}
                }
                res.end();
            });

            ollamaRes.on('error', (err) => {
                res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
                res.end();
            });
        });

        ollamaReq.on('error', (err) => {
            res.write(`data: ${JSON.stringify({ error: 'Cannot connect to local Ollama instance. Is it running?' })}\n\n`);
            res.end();
        });

        ollamaReq.write(payload);
        ollamaReq.end();

    } catch (error) {
        console.error('Chat Error:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to process chat request.' });
        }
    }
});

// API: Clear vector database
app.post('/api/clear', (req, res) => {
    vectorStore = [];
    res.json({ success: true, message: 'Vector database cleared.' });
});

const PORT = process.env.PORT || 3020;
app.listen(PORT, () => {
    console.log(`🚀 Ask Your Documents API running on http://localhost:${PORT}`);
});
