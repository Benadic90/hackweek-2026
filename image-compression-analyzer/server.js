const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Serve static frontend files from the 'public' directory
app.use(express.static('public'));

// Configure multer to store uploaded files in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/**
 * POST /api/compress
 * Receives an image and a quality parameter (1-100).
 * Compresses the image on-the-fly and returns the compressed payload along with metrics.
 */
app.post('/api/compress', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Please upload an image.' });
        }

        // Parse quality (default to 80 if not provided)
        const quality = parseInt(req.body.quality) || 80;

        const originalBuffer = req.file.buffer;
        const originalSize = originalBuffer.length;

        // Extract original image metadata
        const metadata = await sharp(originalBuffer).metadata();
        const dimensions = `${metadata.width} x ${metadata.height}`;

        // Compress the image. 
        // We output as JPEG to clearly demonstrate compression artifacts and ratio.
        const compressedBuffer = await sharp(originalBuffer)
            .jpeg({ quality: quality })
            .toBuffer();

        const compressedSize = compressedBuffer.length;

        // Calculate metrics
        const ratio = ((1 - (compressedSize / originalSize)) * 100).toFixed(1);
        
        // Convert buffers to base64 Data URLs for frontend rendering
        const originalDataUrl = `data:${req.file.mimetype};base64,${originalBuffer.toString('base64')}`;
        const compressedDataUrl = `data:image/jpeg;base64,${compressedBuffer.toString('base64')}`;

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
        console.error('Server error during compression:', error);
        res.status(500).json({ error: 'Failed to compress the image.' });
    }
});

// Start the Express server
app.listen(port, () => {
    console.log(`🚀 Image Compression Analyzer running at http://localhost:${port}`);
});
