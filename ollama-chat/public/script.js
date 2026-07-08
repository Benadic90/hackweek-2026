// chat logic with history saved to localStorage

const messagesDiv = document.getElementById('messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const clearBtn = document.getElementById('clear-btn');
const newChatBtn = document.getElementById('new-chat-btn');
const modelSelect = document.getElementById('model-select');
const historyList = document.getElementById('history-list');

let chatHistory = []; // current conversation messages for ollama
let isGenerating = false;
let currentChatId = null;

// ---- localStorage helpers ----
function getAllChats() {
  let data = localStorage.getItem('ollama_chats');
  return data ? JSON.parse(data) : [];
}

function saveAllChats(chats) {
  localStorage.setItem('ollama_chats', JSON.stringify(chats));
}

function saveCurrentChat() {
  if (chatHistory.length === 0) return;

  let chats = getAllChats();
  let existing = chats.find(c => c.id === currentChatId);

  // use first user message as title
  let title = 'New Chat';
  let firstUserMsg = chatHistory.find(m => m.role === 'user');
  if (firstUserMsg) {
    title = firstUserMsg.content.substring(0, 40);
    if (firstUserMsg.content.length > 40) title += '...';
  }

  if (existing) {
    existing.messages = chatHistory;
    existing.title = title;
    existing.updatedAt = Date.now();
  } else {
    chats.unshift({
      id: currentChatId,
      title: title,
      messages: chatHistory,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
  }

  saveAllChats(chats);
  renderHistory();
}

function deleteChat(chatId) {
  let chats = getAllChats().filter(c => c.id !== chatId);
  saveAllChats(chats);
  if (currentChatId === chatId) {
    startNewChat();
  }
  renderHistory();
}

// ---- render history sidebar ----
function renderHistory() {
  let chats = getAllChats();
  historyList.innerHTML = '';

  if (chats.length === 0) {
    historyList.innerHTML = '<div class="history-empty">No conversations yet</div>';
    return;
  }

  chats.forEach(chat => {
    let item = document.createElement('div');
    item.className = 'history-item' + (chat.id === currentChatId ? ' active' : '');

    let titleSpan = document.createElement('span');
    titleSpan.className = 'history-title';
    titleSpan.textContent = chat.title;
    titleSpan.onclick = () => loadChat(chat.id);

    let deleteBtn = document.createElement('button');
    deleteBtn.className = 'history-delete';
    deleteBtn.innerHTML = '✕';
    deleteBtn.title = 'Delete';
    deleteBtn.onclick = (e) => { e.stopPropagation(); deleteChat(chat.id); };

    item.appendChild(titleSpan);
    item.appendChild(deleteBtn);
    historyList.appendChild(item);
  });
}

function loadChat(chatId) {
  let chats = getAllChats();
  let chat = chats.find(c => c.id === chatId);
  if (!chat) return;

  currentChatId = chatId;
  chatHistory = [...chat.messages];

  // re-render messages
  messagesDiv.innerHTML = '';
  for (let msg of chatHistory) {
    addMessage(msg.role === 'user' ? 'user' : 'assistant', msg.content);
  }
  renderHistory();
}

function startNewChat() {
  currentChatId = 'chat_' + Date.now();
  chatHistory = [];
  messagesDiv.innerHTML = `
    <div class="welcome">
      <div class="welcome-icon">💬</div>
      <h2>Chat with Ollama</h2>
      <p>Start a conversation with your local AI model. Type a message below to begin.</p>
    </div>
  `;
  renderHistory();
  userInput.focus();
}

// ---- load models ----
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
  } catch (e) {}
}

loadModels();

// ---- textarea auto-resize ----
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
newChatBtn.addEventListener('click', startNewChat);

clearBtn.addEventListener('click', () => {
  localStorage.removeItem('ollama_chats');
  startNewChat();
});

// ---- message rendering ----
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

// ---- send message ----
async function sendMessage() {
  const text = userInput.value.trim();
  if (!text || isGenerating) return;

  isGenerating = true;
  sendBtn.disabled = true;

  addMessage('user', text);
  userInput.value = '';
  userInput.style.height = 'auto';

  chatHistory.push({ role: 'user', content: text });
  saveCurrentChat();

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

          if (data.done && fullResponse) {
            chatHistory.push({ role: 'assistant', content: fullResponse });
            saveCurrentChat();
          }
        } catch (e) {}
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

// ---- init ----
startNewChat();
