// --- DOM Element References ---
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const loading = document.getElementById('loading');
const workspace = document.getElementById('workspace');

const qualitySlider = document.getElementById('quality-slider');
const qualityVal = document.getElementById('quality-val');
const downloadBtn = document.getElementById('download-btn');
const resetBtn = document.getElementById('reset-btn');

const mOriginalSize = document.getElementById('m-original-size');
const mCompressedSize = document.getElementById('m-compressed-size');
const mRatio = document.getElementById('m-ratio');
const mDimensions = document.getElementById('m-dimensions');

const previewOriginal = document.getElementById('preview-original');
const previewCompressed = document.getElementById('preview-compressed');
const lossBadge = document.getElementById('loss-badge');

// --- State Variables ---
let currentFile = null;
let compressionTimeout = null;

// --- Drag & Drop Handlers ---
dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
        handleFile(e.dataTransfer.files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
});

/**
 * Initializes the workspace when a valid file is loaded.
 */
function handleFile(file) {
    currentFile = file;
    dropZone.classList.add('hidden');
    
    // Set slider back to default balanced state (80%)
    qualitySlider.value = 80;
    qualityVal.textContent = 80;
    
    processCompression();
}

// --- Dynamic Quality Slider ---
qualitySlider.addEventListener('input', (e) => {
    // Instantly update the visual label
    qualityVal.textContent = e.target.value;
    
    // Debounce the network request. 
    // This prevents API flooding while the user is actively dragging the slider.
    clearTimeout(compressionTimeout);
    compressionTimeout = setTimeout(() => {
        processCompression();
    }, 300); // Wait 300ms after the slider stops moving
});

/**
 * Sends the current file and target quality to the backend API for compression.
 */
async function processCompression() {
    if (!currentFile) return;

    // Show loading spinner if this is the very first upload
    if (workspace.classList.contains('hidden')) {
        loading.classList.remove('hidden');
    }

    const formData = new FormData();
    formData.append('image', currentFile);
    formData.append('quality', qualitySlider.value);

    try {
        const response = await fetch('/api/compress', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Server error during compression pipeline.');
        }

        updateUI(data);
        
    } catch (error) {
        alert(error.message);
        // Reset to initial state on failure
        dropZone.classList.remove('hidden');
    } finally {
        loading.classList.add('hidden');
    }
}

/**
 * Utility to format raw byte values into human-readable sizes (KB, MB).
 */
function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Re-renders the metrics board and preview images with the fresh data payload.
 */
function updateUI(data) {
    // Unhide the workspace if it was hidden
    workspace.classList.remove('hidden');

    // Update real-time metrics
    mOriginalSize.textContent = formatBytes(data.originalSize);
    mCompressedSize.textContent = formatBytes(data.compressedSize);
    mRatio.textContent = `${data.ratio}%`;
    mDimensions.textContent = data.dimensions;

    // Update the warning badge for quality loss
    lossBadge.textContent = `${data.qualityLoss}% Est. Loss`;

    // Render the base64 payloads to the DOM
    previewOriginal.src = data.originalDataUrl;
    previewCompressed.src = data.compressedDataUrl;

    // Attach the compressed payload to the download button
    downloadBtn.href = data.compressedDataUrl;
}

// --- Reset Mechanism ---
resetBtn.addEventListener('click', () => {
    // Purge state and clear inputs
    currentFile = null;
    fileInput.value = '';
    
    // Reset view
    workspace.classList.add('hidden');
    dropZone.classList.remove('hidden');
});
