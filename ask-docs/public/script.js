const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const statusMsg = document.getElementById('upload-status');
const docList = document.getElementById('doc-list');
const clearDbBtn = document.getElementById('clear-db-btn');

const messagesDiv = document.getElementById('messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

let isGenerating = false;

// --- Drag & Drop Upload ---
dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length) {
        uploadFiles(e.dataTransfer.files);
    }
});
fileInput.addEventListener('change', () => {
    if (fileInput.files.length) {
        uploadFiles(fileInput.files);
    }
});

async function uploadFiles(files) {
    const formData = new FormData();
    let count = 0;
    
    for (let file of files) {
        if (file.type === 'application/pdf' || file.type === 'text/plain') {
            formData.append('documents', file);
            count++;
        }
    }

    if (count === 0) {
        setStatus('Please upload PDF or TXT files only.', 'error');
        return;
    }

    setStatus(`Processing ${count} document(s)... This may take a moment to generate embeddings locally.`, 'loading');

    try {
        const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        
        if (data.success) {
            setStatus(data.message, 'success');
            data.docs.forEach(doc => addDocumentToList(doc));
        } else {
            setStatus(data.error || 'Upload failed.', 'error');
        }
    } catch (err) {
        setStatus('Network error during upload.', 'error');
    }
}

function setStatus(msg, type) {
    statusMsg.textContent = msg;
    statusMsg.className = `status-msg ${type}`;
    setTimeout(() => { statusMsg.textContent = ''; }, 5000);
}

function addDocumentToList(filename) {
    const emptyState = docList.querySelector('.empty-state');
    if (emptyState) emptyState.remove();

    const div = document.createElement('div');
    div.className = 'doc-item';
    div.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                     <span title="${filename}">${filename}</span>`;
    docList.appendChild(div);
}

clearDbBtn.addEventListener('click', async () => {
    try {
        await fetch('/api/clear', { method: 'POST' });
        docList.innerHTML = '<div class="empty-state">No documents uploaded yet.</div>';
        setStatus('Database cleared.', 'success');
    } catch (err) {}
});

// --- Chat Interface ---
userInput.addEventListener('input', () => {
    userInput.style.height = 'auto';
    userInput.style.height = Math.min(userInput.scrollHeight, 150) + 'px';
});

userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

sendBtn.addEventListener('click', sendMessage);

function addMessage(role, content) {
    const welcome = messagesDiv.querySelector('.welcome');
    if (welcome) welcome.remove();

    const div = document.createElement('div');
    div.className = `message ${role}`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = role === 'user' ? '👤' : '🤖';

    const bubble = document.createElement('div');
    bubble.className = 'message-content';
    bubble.textContent = content;

    div.appendChild(avatar);
    div.appendChild(bubble);
    messagesDiv.appendChild(div);
    scrollToBottom();

    return bubble;
}

function scrollToBottom() {
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function addLoadingIndicator() {
    const welcome = messagesDiv.querySelector('.welcome');
    if (welcome) welcome.remove();

    const div = document.createElement('div');
    div.className = 'message assistant';
    div.id = 'loading-msg';
    div.innerHTML = `<div class="message-avatar">🤖</div>
                     <div class="message-content"><div class="loading-dots"><span></span><span></span><span></span></div></div>`;
    messagesDiv.appendChild(div);
    scrollToBottom();
}

function removeLoadingIndicator() {
    const el = document.getElementById('loading-msg');
    if (el) el.remove();
}

async function sendMessage() {
    const text = userInput.value.trim();
    if (!text || isGenerating) return;

    isGenerating = true;
    sendBtn.disabled = true;

    addMessage('user', text);
    userInput.value = '';
    userInput.style.height = 'auto';

    addLoadingIndicator();

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: text })
        });

        removeLoadingIndicator();

        const aiBubble = addMessage('assistant', '');
        let fullResponse = '';

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (let line of lines) {
                if (!line.startsWith('data: ')) continue;
                let jsonStr = line.slice(6);

                try {
                    const data = JSON.parse(jsonStr);

                    if (data.error) {
                        aiBubble.innerHTML = '';
                        const errDiv = document.createElement('div');
                        errDiv.className = 'error-msg';
                        errDiv.textContent = data.error;
                        aiBubble.parentElement.replaceChild(errDiv, aiBubble);
                        break;
                    }

                    if (data.token) {
                        fullResponse += data.token;
                        aiBubble.textContent = fullResponse;
                        scrollToBottom();
                    }

                    if (data.done && data.sources && data.sources.length > 0) {
                        const sourceBadge = document.createElement('div');
                        sourceBadge.className = 'sources-badge';
                        sourceBadge.innerHTML = `<strong>Sources:</strong> ${data.sources.join(', ')}`;
                        aiBubble.appendChild(sourceBadge);
                        scrollToBottom();
                    }
                } catch (e) {}
            }
        }

    } catch (err) {
        removeLoadingIndicator();
        const errDiv = document.createElement('div');
        errDiv.className = 'error-msg';
        errDiv.textContent = 'Failed to process request. Ensure Ollama is running locally.';
        messagesDiv.appendChild(errDiv);
        scrollToBottom();
    }

    isGenerating = false;
    sendBtn.disabled = false;
    userInput.focus();
}
