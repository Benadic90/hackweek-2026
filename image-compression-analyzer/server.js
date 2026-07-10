const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Serve static frontend files from the 'public' directory
app.use(express.static('public'));

// Configure multer to store uploaded files entirely in memory
// This avoids costly disk I/O operations and speeds up the sharp processing pipeline
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/**
 * POST /api/compress
 * Receives an image and a quality parameter (1-100).
 * Compresses the image on-the-fly using the high-performance sharp library,
 * and returns the compressed payload along with calculated metrics.
 */
app.post('/api/compress', upload.single('image'), async (req, res) => {
    try {
        // Validate payload
        if (!req.file) {
            return res.status(400).json({ error: 'Please upload an image.' });
        }

        // Parse quality (default to a balanced 80 if not provided)
        const quality = parseInt(req.body.quality) || 80;

        const originalBuffer = req.file.buffer;
        const originalSize = originalBuffer.length;

        // Extract original image metadata directly from the buffer
        const metadata = await sharp(originalBuffer).metadata();
        const dimensions = `${metadata.width} x ${metadata.height}`;

        // Execute the compression pipeline. 
        // We output as JPEG to clearly demonstrate compression artifacts and ratio dynamically.
        const compressedBuffer = await sharp(originalBuffer)
            .jpeg({ quality: quality, progressive: true })
            .toBuffer();

        const compressedSize = compressedBuffer.length;

        // Calculate exact compression ratio
        const ratio = ((1 - (compressedSize / originalSize)) * 100).toFixed(1);
        
        // Convert buffers to base64 Data URLs so the frontend can render them instantly
        // without needing a secondary network request
        const originalDataUrl = `data:${req.file.mimetype};base64,${originalBuffer.toString('base64')}`;
        const compressedDataUrl = `data:image/jpeg;base64,${compressedBuffer.toString('base64')}`;

        // Return the full analytics payload
        res.json({
            originalSize,
            compressedSize,
            ratio,
            dimensions,
            qualityLoss: 100 - quality,
            originalDataUrl,
            compressedDataUrl
        });

    } catch (error) {
        console.error('Server error during compression pipeline execution:', error);
        res.status(500).json({ error: 'Failed to compress the image.' });
    }
});

// Boot up the Express server
app.listen(port, () => {
    console.log(`🚀 Image Compression Analyzer running at http://localhost:${port}`);
});
