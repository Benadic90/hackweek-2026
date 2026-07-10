const express = require('express');
const multer = require('multer');
const imghash = require('imghash');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Setup static file serving for frontend
app.use(express.static('public'));

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Helper function to convert hex hash to binary string
function hexToBinary(hex) {
    let binary = '';
    for (let i = 0; i < hex.length; i++) {
        binary += parseInt(hex[i], 16).toString(2).padStart(4, '0');
    }
    return binary;
}

// Calculate similarity percentage based on Hamming Distance
function calculateSimilarity(hash1, hash2) {
    const bin1 = hexToBinary(hash1);
    const bin2 = hexToBinary(hash2);
    let distance = 0;
    
    // Safety check just in case hash lengths differ, though they shouldn't
    const minLength = Math.min(bin1.length, bin2.length);
    for (let i = 0; i < minLength; i++) {
        if (bin1[i] !== bin2[i]) {
            distance++;
        }
    }
    
    // Each hex char is 4 bits. A typical 16 char hex hash is 64 bits.
    const maxBits = Math.max(bin1.length, bin2.length);
    const similarity = ((maxBits - distance) / maxBits) * 100;
    
    return similarity;
}

app.post('/api/compare', upload.array('images', 20), async (req, res) => {
    try {
        if (!req.files || req.files.length < 2) {
            return res.status(400).json({ error: 'Please upload at least two images to compare.' });
        }

        const hashedImages = [];

        // Generate hashes for all uploaded images
        for (const file of req.files) {
            try {
                // imghash expects a buffer or a file path
                const hash = await imghash.hash(file.buffer);
                
                // Convert buffer to base64 for frontend display
                const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

                hashedImages.push({
                    name: file.originalname,
                    hash: hash,
                    dataUrl: base64Image
                });
            } catch (err) {
                console.error(`Error hashing ${file.originalname}:`, err);
                // Skip files that aren't valid images
            }
        }

        // Compare all images against each other
        const results = [];
        
        for (let i = 0; i < hashedImages.length; i++) {
            for (let j = i + 1; j < hashedImages.length; j++) {
                const img1 = hashedImages[i];
                const img2 = hashedImages[j];
                
                const similarity = calculateSimilarity(img1.hash, img2.hash);
                
                results.push({
                    image1: img1,
                    image2: img2,
                    similarity: parseFloat(similarity.toFixed(2))
                });
            }
        }

        // Sort by similarity descending
        results.sort((a, b) => b.similarity - a.similarity);

        res.json({ results });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'An error occurred while processing the images.' });
    }
});

app.listen(port, () => {
    console.log(`Duplicate Image Finder running at http://localhost:${port}`);
});
