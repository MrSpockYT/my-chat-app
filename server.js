// server.js
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 3000;

// Serve static files from the 'public' folder
app.use(express.static('public'));

// Listen for incoming connections
io.on('connection', (socket) => {
  console.log('A user connected.');

  // Listen for chatMessage events from the client
  socket.on('chatMessage', (msg) => {
    // Broadcast to everyone
    io.emit('chatMessage', msg);
  });

  // On disconnect
  socket.on('disconnect', () => {
    console.log('A user disconnected.');
  });
});

http.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
