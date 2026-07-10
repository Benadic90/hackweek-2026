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

let currentFile = null;
let compressionTimeout = null;

// --- Upload Handlers ---
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

function handleFile(file) {
    currentFile = file;
    dropZone.classList.add('hidden');
    
    // Set slider to default 80
    qualitySlider.value = 80;
    qualityVal.textContent = 80;
    
    processCompression();
}

// --- Slider Handling (Debounced) ---
qualitySlider.addEventListener('input', (e) => {
    qualityVal.textContent = e.target.value;
    
    // Debounce the server request so we don't spam the API while dragging
    clearTimeout(compressionTimeout);
    compressionTimeout = setTimeout(() => {
        processCompression();
    }, 300); // Wait 300ms after user stops moving slider
});

// --- API Request ---
async function processCompression() {
    if (!currentFile) return;

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
            throw new Error(data.error || 'Server error during compression.');
        }

        updateUI(data);
        
    } catch (error) {
        alert(error.message);
        dropZone.classList.remove('hidden');
    } finally {
        loading.classList.add('hidden');
    }
}

// --- UI Updates ---
function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function updateUI(data) {
    workspace.classList.remove('hidden');

    // Update Metrics
    mOriginalSize.textContent = formatBytes(data.originalSize);
    mCompressedSize.textContent = formatBytes(data.compressedSize);
    mRatio.textContent = `${data.ratio}%`;
    mDimensions.textContent = data.dimensions;

    // Update Loss Badge
    lossBadge.textContent = `${data.qualityLoss}% Est. Loss`;

    // Update Images
    previewOriginal.src = data.originalDataUrl;
    previewCompressed.src = data.compressedDataUrl;

    // Setup Download link
    downloadBtn.href = data.compressedDataUrl;
}

// --- Reset UI ---
resetBtn.addEventListener('click', () => {
    currentFile = null;
    fileInput.value = '';
    workspace.classList.add('hidden');
    dropZone.classList.remove('hidden');
});
