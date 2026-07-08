// connect to the socket.io server
const socket = io();

// grab all the DOM stuff we need
const canvas = document.getElementById('whiteboard');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('color-picker');
const brushSize = document.getElementById('brush-size');
const sizeLabel = document.getElementById('size-label');
const eraserBtn = document.getElementById('eraser-btn');
const undoBtn = document.getElementById('undo-btn');
const clearBtn = document.getElementById('clear-btn');
const userCountEl = document.getElementById('user-count');

// give this browser tab a unique id so the server can track who drew what
const myUserId = Math.random().toString(36).substr(2, 8);

// drawing state
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let isEraser = false;
let currentColor = '#ffffff';
let currentSize = 4;

// --- Canvas setup ---

// make canvas fill the whole screen below the header
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - 50; // subtract header height
}

// need to resize on load and when window changes
resizeCanvas();
window.addEventListener('resize', () => {
  resizeCanvas();
  // ask server to resend everything since resize wipes the canvas
  socket.emit('request-redraw');
});

// --- Drawing functions ---

// draw a single line segment on our local canvas
function drawLine(x1, y1, x2, y2, color, size) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = size;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
}

// --- Mouse events ---

canvas.addEventListener('mousedown', (e) => {
  isDrawing = true;
  lastX = e.offsetX;
  lastY = e.offsetY;
});

canvas.addEventListener('mousemove', (e) => {
  if (!isDrawing) return;

  const x = e.offsetX;
  const y = e.offsetY;
  const color = isEraser ? '#111' : currentColor;

  // draw it locally first so it feels instant
  drawLine(lastX, lastY, x, y, color, currentSize);

  // send the stroke to everyone else
  socket.emit('draw', {
    x1: lastX,
    y1: lastY,
    x2: x,
    y2: y,
    color: color,
    size: currentSize,
    userId: myUserId
  });

  lastX = x;
  lastY = y;
});

canvas.addEventListener('mouseup', () => { isDrawing = false; });
canvas.addEventListener('mouseleave', () => { isDrawing = false; });

// --- Touch support (for tablets/phones) ---

canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  isDrawing = true;
  lastX = touch.clientX - rect.left;
  lastY = touch.clientY - rect.top;
});

canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  if (!isDrawing) return;

  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;
  const color = isEraser ? '#111' : currentColor;

  drawLine(lastX, lastY, x, y, color, currentSize);

  socket.emit('draw', {
    x1: lastX,
    y1: lastY,
    x2: x,
    y2: y,
    color: color,
    size: currentSize,
    userId: myUserId
  });

  lastX = x;
  lastY = y;
});

canvas.addEventListener('touchend', () => { isDrawing = false; });

// --- Toolbar controls ---

colorPicker.addEventListener('input', (e) => {
  currentColor = e.target.value;
  // if they pick a color, turn off eraser automatically
  isEraser = false;
  eraserBtn.classList.remove('active');
});

brushSize.addEventListener('input', (e) => {
  currentSize = parseInt(e.target.value);
  sizeLabel.textContent = currentSize;
});

eraserBtn.addEventListener('click', () => {
  isEraser = !isEraser;
  eraserBtn.classList.toggle('active');
});

undoBtn.addEventListener('click', () => {
  socket.emit('undo', myUserId);
});

clearBtn.addEventListener('click', () => {
  // clear local canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // tell everyone else to clear too
  socket.emit('clear');
});

// --- Socket.IO listeners ---

// when another user draws something
socket.on('draw', (data) => {
  drawLine(data.x1, data.y1, data.x2, data.y2, data.color, data.size);
});

// when someone clears the board
socket.on('clear', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// load the full drawing history (happens when you first join)
socket.on('load-history', (history) => {
  history.forEach((data) => {
    drawLine(data.x1, data.y1, data.x2, data.y2, data.color, data.size);
  });
});

// full redraw after an undo
socket.on('full-redraw', (history) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  history.forEach((data) => {
    drawLine(data.x1, data.y1, data.x2, data.y2, data.color, data.size);
  });
});

// update the online user count
socket.on('user-count', (count) => {
  userCountEl.textContent = count;
});
