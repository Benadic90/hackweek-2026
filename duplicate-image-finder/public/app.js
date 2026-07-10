const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const loading = document.getElementById('loading');
const resultsContainer = document.getElementById('results-container');
const resultsGrid = document.getElementById('results-grid');
const resetBtn = document.getElementById('reset-btn');

// Handle click to upload
dropZone.addEventListener('click', () => fileInput.click());

// Handle drag and drop
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
        handleFiles(e.dataTransfer.files);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFiles(e.target.files);
    }
});

resetBtn.addEventListener('click', () => {
    fileInput.value = '';
    resultsContainer.classList.add('hidden');
    dropZone.classList.remove('hidden');
});

async function handleFiles(files) {
    if (files.length < 2) {
        alert("Please select at least 2 images to compare.");
        return;
    }

    // Show loading state
    dropZone.classList.add('hidden');
    resultsContainer.classList.add('hidden');
    loading.classList.remove('hidden');

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
        formData.append('images', files[i]);
    }

    try {
        const response = await fetch('/api/compare', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Server error');
        }

        renderResults(data.results);
        
    } catch (error) {
        alert(error.message);
        loading.classList.add('hidden');
        dropZone.classList.remove('hidden');
    }
}

function renderResults(results) {
    loading.classList.add('hidden');
    resultsContainer.classList.remove('hidden');
    resultsGrid.innerHTML = '';

    // Filter results to show only meaningful matches (e.g., > 65% similarity)
    // You can adjust this threshold
    const significantMatches = results.filter(r => r.similarity >= 65);

    if (significantMatches.length === 0) {
        resultsGrid.innerHTML = `
            <div class="no-results">
                <h3>No similar images found</h3>
                <p>The uploaded images do not appear to be duplicates or visually similar based on their perceptual hashes.</p>
            </div>
        `;
        return;
    }

    significantMatches.forEach(match => {
        let badgeClass = 'low';
        if (match.similarity >= 95) badgeClass = 'exact';
        else if (match.similarity >= 80) badgeClass = 'high';

        const card = document.createElement('div');
        card.className = 'match-card';
        card.innerHTML = `
            <div class="match-header">
                <h3>Potential Match Found</h3>
                <span class="badge ${badgeClass}">${match.similarity}% Similar</span>
            </div>
            <div class="images-container">
                <div class="image-box">
                    <img src="${match.image1.dataUrl}" alt="${match.image1.name}" class="image-preview">
                    <div class="image-meta">
                        <strong>${match.image1.name}</strong>
                        <span>Hash: ${match.image1.hash}</span>
                    </div>
                </div>
                <div class="image-box">
                    <img src="${match.image2.dataUrl}" alt="${match.image2.name}" class="image-preview">
                    <div class="image-meta">
                        <strong>${match.image2.name}</strong>
                        <span>Hash: ${match.image2.hash}</span>
                    </div>
                </div>
            </div>
        `;
        resultsGrid.appendChild(card);
    });
}
