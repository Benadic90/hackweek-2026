const express = require('express');
const multer = require('multer');
const imghash = require('imghash');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Serve static frontend files from the 'public' directory
app.use(express.static('public'));

// Configure multer to store uploaded files temporarily in memory
// This is faster and cleaner than writing them to disk just for hashing
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/**
 * Helper function to convert a hexadecimal hash string into a binary string.
 * We need binary to calculate the Hamming distance between two perceptual hashes.
 */
function hexToBinary(hex) {
    let binary = '';
    for (let i = 0; i < hex.length; i++) {
        // Convert each hex character to a 4-bit binary representation
        binary += parseInt(hex[i], 16).toString(2).padStart(4, '0');
    }
    return binary;
}

/**
 * Calculates the visual similarity percentage between two perceptual hashes.
 * It uses the Hamming Distance algorithm (counting the number of differing bits).
 */
function calculateSimilarity(hash1, hash2) {
    const bin1 = hexToBinary(hash1);
    const bin2 = hexToBinary(hash2);
    
    let distance = 0;
    
    // Compare bits one by one to find the Hamming distance
    const minLength = Math.min(bin1.length, bin2.length);
    for (let i = 0; i < minLength; i++) {
        if (bin1[i] !== bin2[i]) {
            distance++;
        }
    }
    
    // Calculate percentage: (Total Bits - Differing Bits) / Total Bits * 100
    // A standard blockhash is usually 64 bits (16 hex chars)
    const maxBits = Math.max(bin1.length, bin2.length);
    const similarity = ((maxBits - distance) / maxBits) * 100;
    
    return similarity;
}

/**
 * POST /api/compare
 * Endpoint to receive exactly two images, hash them using blockhash algorithm,
 * and return their visual similarity score.
 */
app.post('/api/compare', upload.array('images', 2), async (req, res) => {
    try {
        // Ensure exactly two files were uploaded
        if (!req.files || req.files.length !== 2) {
            return res.status(400).json({ error: 'Please upload exactly two images to compare.' });
        }

        const hashedImages = [];

        // Process and generate perceptual hashes for both images
        for (const file of req.files) {
            try {
                // imghash expects a buffer (which we get from multer memory storage)
                const hash = await imghash.hash(file.buffer);

                hashedImages.push({
                    name: file.originalname,
                    hash: hash
                });
            } catch (err) {
                console.error(`Error hashing file ${file.originalname}:`, err);
                return res.status(422).json({ error: `Could not process image: ${file.originalname}` });
            }
        }

        // Calculate the similarity between the two processed images
        const img1 = hashedImages[0];
        const img2 = hashedImages[1];
        
        const similarity = calculateSimilarity(img1.hash, img2.hash);
        
        // Return the final payload
        res.json({ 
            results: [{
                image1: img1,
                image2: img2,
                similarity: parseFloat(similarity.toFixed(2))
            }]
        });

    } catch (error) {
        console.error('Server error during comparison:', error);
        res.status(500).json({ error: 'An internal server error occurred while processing the images.' });
    }
});

// Start the Express server
app.listen(port, () => {
    console.log(`🚀 Duplicate Image Finder running at http://localhost:${port}`);
});
