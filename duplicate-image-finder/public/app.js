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

let fileData1 = null;
let fileData2 = null;

function setupUploader(box, input, preview, content, fileIndex) {
    box.addEventListener('click', () => input.click());

    box.addEventListener('dragover', (e) => {
        e.preventDefault();
        box.classList.add('dragover');
    });

    box.addEventListener('dragleave', () => {
        box.classList.remove('dragover');
    });

    box.addEventListener('drop', (e) => {
        e.preventDefault();
        box.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0], preview, content, fileIndex);
        }
    });

    input.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0], preview, content, fileIndex);
        }
    });
}

function handleFile(file, preview, content, fileIndex) {
    if (fileIndex === 1) fileData1 = file;
    if (fileIndex === 2) fileData2 = file;

    const reader = new FileReader();
    reader.onload = (e) => {
        preview.src = e.target.result;
        preview.classList.remove('hidden');
        content.classList.add('hidden');
        checkReady();
    };
    reader.readAsDataURL(file);
}

function checkReady() {
    if (fileData1 && fileData2) {
        compareBtn.disabled = false;
    }
}

setupUploader(box1, file1, preview1, content1, 1);
setupUploader(box2, file2, preview2, content2, 2);

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

compareBtn.addEventListener('click', async () => {
    compareBtn.classList.add('hidden');
    loading.classList.remove('hidden');

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
            throw new Error(data.error || 'Server error');
        }

        renderResult(data.results[0]);
        
    } catch (error) {
        alert(error.message);
        compareBtn.classList.remove('hidden');
    } finally {
        loading.classList.add('hidden');
    }
});

function renderResult(match) {
    resultsContainer.classList.remove('hidden');
    resetBtn.classList.remove('hidden');

    similarityBadge.textContent = `${match.similarity}% Similar`;
    
    similarityBadge.className = 'badge';
    if (match.similarity >= 95) similarityBadge.classList.add('exact');
    else if (match.similarity >= 80) similarityBadge.classList.add('high');
    else similarityBadge.classList.add('low');

    hash1Text.textContent = match.image1.hash;
    hash2Text.textContent = match.image2.hash;
}
