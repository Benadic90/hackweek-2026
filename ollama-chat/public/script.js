// chat logic

const messagesDiv = document.getElementById('messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const clearBtn = document.getElementById('clear-btn');
const modelSelect = document.getElementById('model-select');

// conversation history (sent to ollama each time for context)
let chatHistory = [];
let isGenerating = false;

// load available models on startup
async function loadModels() {
  try {
    const res = await fetch('/api/models');
    const data = await res.json();
    if (data.models && data.models.length > 0) {
      modelSelect.innerHTML = '';
      data.models.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m;
        opt.textContent = m;
        modelSelect.appendChild(opt);
      });
    }
  } catch (e) {
    // ollama might not be running yet, that's ok
  }
}

loadModels();

// auto-resize textarea
userInput.addEventListener('input', () => {
  userInput.style.height = 'auto';
  userInput.style.height = Math.min(userInput.scrollHeight, 150) + 'px';
});

// send on enter (shift+enter for newline)
userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

sendBtn.addEventListener('click', sendMessage);

clearBtn.addEventListener('click', () => {
  chatHistory = [];
  messagesDiv.innerHTML = `
    <div class="welcome">
      <div class="welcome-icon">💬</div>
      <h2>Chat with Ollama</h2>
      <p>Start a conversation with your local AI model. Type a message below to begin.</p>
    </div>
  `;
});

function addMessage(role, content) {
  // remove welcome screen if its there
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

function addLoadingIndicator() {
  const welcome = messagesDiv.querySelector('.welcome');
  if (welcome) welcome.remove();

  const div = document.createElement('div');
  div.className = 'message assistant';
  div.id = 'loading-msg';

  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  avatar.textContent = '🤖';

  const bubble = document.createElement('div');
  bubble.className = 'message-content';
  bubble.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>';

  div.appendChild(avatar);
  div.appendChild(bubble);
  messagesDiv.appendChild(div);
  scrollToBottom();
}

function removeLoadingIndicator() {
  const el = document.getElementById('loading-msg');
  if (el) el.remove();
}

function scrollToBottom() {
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

async function sendMessage() {
  const text = userInput.value.trim();
  if (!text || isGenerating) return;

  isGenerating = true;
  sendBtn.disabled = true;

  // show user message
  addMessage('user', text);
  userInput.value = '';
  userInput.style.height = 'auto';

  // add to history
  chatHistory.push({ role: 'user', content: text });

  // show loading
  addLoadingIndicator();

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelSelect.value,
        messages: chatHistory
      })
    });

    removeLoadingIndicator();

    // create the AI message bubble and stream tokens into it
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

          if (data.done) {
            // add to history for context
            if (fullResponse) {
              chatHistory.push({ role: 'assistant', content: fullResponse });
            }
          }
        } catch (e) {
          // skip bad json
        }
      }
    }

  } catch (err) {
    removeLoadingIndicator();
    const errDiv = document.createElement('div');
    errDiv.className = 'error-msg';
    errDiv.textContent = 'Failed to connect. Make sure Ollama is running locally.';
    messagesDiv.appendChild(errDiv);
    scrollToBottom();
  }

  isGenerating = false;
  sendBtn.disabled = false;
  userInput.focus();
}
