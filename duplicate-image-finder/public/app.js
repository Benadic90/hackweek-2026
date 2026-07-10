// --- DOM Elements ---
const box1 = document.getElementById('drop-zone-1');
const file1 = document.getElementById('file-input-1');
const preview1 = document.getElementById('preview-1');
const content1 = document.getElementById('content-1');

const box2 = document.getElementById('drop-zone-2');
const file2 = document.getElementById('file-input-2');
const preview2 = document.getElementById('preview-2');
const content2 = document.getElementById('content-2');

const compareBtn = document.getElementById('compare-btn');
const resetBtn = document.getElementById('reset-btn');
const loading = document.getElementById('loading');
const resultsContainer = document.getElementById('results-container');
const similarityBadge = document.getElementById('similarity-badge');
const hash1Text = document.getElementById('hash-1-text');
const hash2Text = document.getElementById('hash-2-text');

// State variables to hold the selected files
let fileData1 = null;
let fileData2 = null;

/**
 * Initializes the drag-and-drop and click upload listeners for a specific upload box.
 */
function setupUploader(box, input, preview, content, fileIndex) {
    // Trigger file dialog on click
    box.addEventListener('click', () => input.click());

    // Highlight box when dragging files over it
    box.addEventListener('dragover', (e) => {
        e.preventDefault();
        box.classList.add('dragover');
    });

    box.addEventListener('dragleave', () => {
        box.classList.remove('dragover');
    });

    // Handle dropped files
    box.addEventListener('drop', (e) => {
        e.preventDefault();
        box.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0], preview, content, fileIndex);
        }
    });

    // Handle files selected via the file dialog
    input.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0], preview, content, fileIndex);
        }
    });
}

/**
 * Reads the selected file and updates the UI preview.
 */
function handleFile(file, preview, content, fileIndex) {
    // Store file in state
    if (fileIndex === 1) fileData1 = file;
    if (fileIndex === 2) fileData2 = file;

    // Use FileReader to display an instant local preview
    const reader = new FileReader();
    reader.onload = (e) => {
        preview.src = e.target.result;
        preview.classList.remove('hidden');
        content.classList.add('hidden');
        
        // Check if both files are uploaded to enable the compare button
        checkReadyState();
    };
    reader.readAsDataURL(file);
}

/**
 * Enables the Compare button if both files have been loaded.
 */
function checkReadyState() {
    if (fileData1 && fileData2) {
        compareBtn.disabled = false;
    }
}

// Initialize the two upload zones
setupUploader(box1, file1, preview1, content1, 1);
setupUploader(box2, file2, preview2, content2, 2);

/**
 * Resets the entire UI back to its initial state.
 */
resetBtn.addEventListener('click', () => {
    fileData1 = null;
    fileData2 = null;
    
    file1.value = '';
    file2.value = '';
    
    preview1.src = '';
    preview2.src = '';
    preview1.classList.add('hidden');
    preview2.classList.add('hidden');
    
    content1.classList.remove('hidden');
    content2.classList.remove('hidden');
    
    compareBtn.disabled = true;
    compareBtn.classList.remove('hidden');
    
    resetBtn.classList.add('hidden');
    resultsContainer.classList.add('hidden');
});

/**
 * Sends both files to the backend for perceptual hashing and comparison.
 */
compareBtn.addEventListener('click', async () => {
    // UI state transitions
    compareBtn.classList.add('hidden');
    loading.classList.remove('hidden');

    // Build the payload
    const formData = new FormData();
    formData.append('images', fileData1);
    formData.append('images', fileData2);

    try {
        const response = await fetch('/api/compare', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Server error processing comparison.');
        }

        renderResult(data.results[0]);
        
    } catch (error) {
        alert(error.message);
        compareBtn.classList.remove('hidden');
    } finally {
        loading.classList.add('hidden');
    }
});

/**
 * Updates the DOM with the comparison results returned from the server.
 */
function renderResult(match) {
    resultsContainer.classList.remove('hidden');
    resetBtn.classList.remove('hidden');

    similarityBadge.textContent = `${match.similarity}% Similar`;
    
    // Style the badge based on confidence level
    similarityBadge.className = 'badge';
    if (match.similarity >= 95) {
        similarityBadge.classList.add('exact');
    } else if (match.similarity >= 80) {
        similarityBadge.classList.add('high');
    } else {
        similarityBadge.classList.add('low');
    }

    hash1Text.textContent = match.image1.hash;
    hash2Text.textContent = match.image2.hash;
}
