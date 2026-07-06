let currentColumn = '';
let cards = JSON.parse(localStorage.getItem('kanbanCards')) || [];

const modal = document.getElementById('task-modal');
const input = document.getElementById('task-input');

// Initialize board
function init() {
  renderBoard();
  setupDragAndDrop();
}

// Generate unique ID
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

// Save to localStorage
function saveCards() {
  localStorage.setItem('kanbanCards', JSON.stringify(cards));
  updateCounts();
}

// Modal handling
function openModal(columnId) {
  currentColumn = columnId;
  modal.classList.add('active');
  input.value = '';
  setTimeout(() => input.focus(), 100);
}

function closeModal() {
  modal.classList.remove('active');
  currentColumn = '';
}

function saveTask() {
  const text = input.value.trim();
  if (!text) return;
  
  const newCard = {
    id: generateId(),
    content: text,
    status: currentColumn
  };
  
  cards.push(newCard);
  saveCards();
  renderBoard();
  closeModal();
}

// Allow Enter key to save
input.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') saveTask();
});

// Delete card
function deleteCard(id) {
  cards = cards.filter(card => card.id !== id);
  saveCards();
  renderBoard();
}

// Render cards into columns
function renderBoard() {
  const columns = ['todo', 'in-progress', 'done'];
  
  columns.forEach(col => {
    const listEl = document.getElementById(`${col}-list`);
    listEl.innerHTML = ''; // clear existing
    
    const columnCards = cards.filter(c => c.status === col);
    
    columnCards.forEach(card => {
      const el = document.createElement('div');
      el.className = 'card';
      el.draggable = true;
      el.dataset.id = card.id;
      
      el.innerHTML = `
        <div class="card-content">${card.content}</div>
        <button class="delete-btn" onclick="deleteCard('${card.id}')">&times;</button>
      `;
      
      // Drag events for individual cards
      el.addEventListener('dragstart', handleDragStart);
      el.addEventListener('dragend', handleDragEnd);
      
      listEl.appendChild(el);
    });
  });
  
  updateCounts();
}

function updateCounts() {
  const columns = ['todo', 'in-progress', 'done'];
  columns.forEach(col => {
    const count = cards.filter(c => c.status === col).length;
    document.getElementById(`count-${col}`).textContent = count;
  });
}

// Drag and drop logic
let draggedCard = null;

function handleDragStart(e) {
  draggedCard = this;
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', this.dataset.id);
}

function handleDragEnd(e) {
  this.classList.remove('dragging');
  draggedCard = null;
  
  // Remove hover effects from all columns
  document.querySelectorAll('.column').forEach(col => {
    col.classList.remove('drag-over');
  });
}

function setupDragAndDrop() {
  const columns = document.querySelectorAll('.column');
  
  columns.forEach(col => {
    col.addEventListener('dragover', e => {
      e.preventDefault(); // needed to allow drop
      e.dataTransfer.dropEffect = 'move';
      col.classList.add('drag-over');
    });
    
    col.addEventListener('dragleave', () => {
      col.classList.remove('drag-over');
    });
    
    col.addEventListener('drop', e => {
      e.preventDefault();
      col.classList.remove('drag-over');
      
      if (!draggedCard) return;
      
      const newStatus = col.dataset.status;
      const cardId = draggedCard.dataset.id;
      
      // Update state
      const cardIndex = cards.findIndex(c => c.id === cardId);
      if (cardIndex > -1) {
        cards[cardIndex].status = newStatus;
        saveCards();
        renderBoard();
      }
    });
  });
}

// Start app
init();
