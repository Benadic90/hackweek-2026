# Image Compression Analyzer

A fullstack application designed to instantly compress images and provide real-time analytical metrics about the file size savings and visual quality loss. 

## Features
- **High-Performance Compression:** Powered by `sharp` (the fastest Node.js image processing library) to compress images on-the-fly.
- **Real-Time Slider:** Adjust the compression quality (1-100) using a smooth slider. The UI features debouncing to ensure optimal performance while continuously fetching the newly compressed image.
- **Side-by-Side Comparison:** View the Original and Compressed images directly next to each other to identify visual artifacts.
- **Live Metrics Board:** Instantly calculates Original Size, Compressed Size, Compression Ratio (%), exact Image Dimensions, and Estimated Quality Loss.
- **Download Capability:** One-click download to save the exact compressed image payload locally.

## Setup Instructions
1. Clone the repository and navigate into this directory:
   ```bash
   cd image-compression-analyzer
   ```
2. Install the necessary dependencies:
   ```bash
   npm install
   ```
3. Start the Express server:
   ```bash
   npm start
   ```
4. Open your web browser and navigate to `http://localhost:3000`.

## How to Test
1. Drag and drop a high-resolution image into the upload zone.
2. Observe the initial metrics and the compressed preview.
3. Slide the Compression Quality slider down to `10%` to see massive space savings (90%+ ratio) but noticeable visual artifacts. 
4. Slide it back up to `90%` to see a near-lossless image with moderate space savings.
5. Click **Download Compressed** to save the optimized file.
