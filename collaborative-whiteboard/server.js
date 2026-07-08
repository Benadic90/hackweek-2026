const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

// set up socket.io with cors so it works when deployed
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// serve all static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// keep track of how many people are on the board
let userCount = 0;

// store the drawing history so new users can see what's already drawn
let drawHistory = [];

io.on('connection', (socket) => {
  userCount++;
  console.log(`User connected — now ${userCount} online`);

  // tell everyone the new user count
  io.emit('user-count', userCount);

  // send the existing drawing to the new user so they don't see a blank canvas
  if (drawHistory.length > 0) {
    socket.emit('load-history', drawHistory);
  }

  // when someone draws, save it and send to everyone else
  socket.on('draw', (data) => {
    drawHistory.push(data);
    socket.broadcast.emit('draw', data);
  });

  // clear the whole board
  socket.on('clear', () => {
    drawHistory = [];
    socket.broadcast.emit('clear');
  });

  // handle undo — remove the last stroke from this user
  socket.on('undo', (userId) => {
    // find and remove the last stroke by this user
    for (let i = drawHistory.length - 1; i >= 0; i--) {
      if (drawHistory[i].userId === userId) {
        drawHistory.splice(i, 1);
        break;
      }
    }
    // redraw everything for all clients
    io.emit('full-redraw', drawHistory);
  });

  socket.on('disconnect', () => {
    userCount--;
    console.log(`User left — now ${userCount} online`);
    io.emit('user-count', userCount);
  });
});

// use whatever port the host gives us, or 3000 locally
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Whiteboard running at http://localhost:${PORT}`);
});
