# Duplicate Image Finder

A fullstack Node.js application built to detect duplicate or visually similar images using perceptual hashing algorithms. 

Unlike cryptographic hashes (which change entirely if a single pixel or metadata tag is modified), this tool uses the `blockhash` algorithm to generate a perceptual hash. It then calculates the Hamming distance between the hashes to determine the exact visual similarity percentage.

## Features
- **Perceptual Hashing:** Generates visual signatures of images using `imghash`.
- **Custom Comparison Engine:** Calculates the Hamming distance between binary representations to find the exact similarity percentage.
- **Side-by-Side UI:** A modern, drag-and-drop interface allowing you to compare two images directly against each other.
- **In-Memory Processing:** Uses `multer` memory storage for rapid processing without cluttering the disk.

## How to Run Locally

### Prerequisites
- Node.js installed on your machine.

### Setup Instructions
1. Clone the repository and navigate into this directory:
   ```bash
   cd duplicate-image-finder
   ```
2. Install the necessary dependencies:
   ```bash
   npm install
   ```
3. Start the Express server:
   ```bash
   npm start
   ```
4. Open your web browser and navigate to:
   ```
   http://localhost:3000
   ```

## How to Test
1. Find an image on your computer.
2. Drag and drop the original image into **Image 1**.
3. For **Image 2**, try dropping:
   - The exact same image (will return **100% Similar**).
   - A compressed or slightly resized version of the image (will return **~90-99% Similar**).
   - A completely different image (will return a low score, e.g., **< 50% Similar**).
4. Click **Compare Images** to see the perceptual hashes and the final score!
