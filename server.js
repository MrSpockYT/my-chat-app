// server.js (CommonJS)

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const Filter = require('bad-words'); // For profanity filtering

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from "public" folder
app.use(express.static('public'));

// Create a new instance of the bad-words filter
const filter = new Filter();

/**
 * Store connected users:
 * Key: socket.id
 * Value: { username: string, isModerator: boolean }
 */
const users = new Map();

// Keep track of banned usernames
const bannedUsers = new Set();

io.on('connection', (socket) => {
  console.log(`New user connected: ${socket.id}`);

  // When a user joins, they send "join" with their chosen username
  socket.on('join', (username) => {
    // Check if user is banned
    if (bannedUsers.has(username.toLowerCase())) {
      socket.emit('chatMessage', 'You are banned from this chat.');
      socket.disconnect(true);
      return;
    }

    // For simplicity, let's say if username is "Admin" or "Mod" (case-insensitive), they're a moderator
    const lowerName = username.toLowerCase();
    const isModerator = (lowerName === 'admin' || lowerName === 'mod');

    // Store user info
    users.set(socket.id, { username, isModerator });

    // Announce to everyone
    io.emit('chatMessage', `${username} has joined the chat.`);
  });

  // Handle chat messages
  socket.on('chatMessage', (msg) => {
    const user = users.get(socket.id);
    if (!user) return;

    const { username, isModerator } = user;

    // Check for profanity
    if (filter.isProfane(msg)) {
      return socket.emit('chatMessage', 'No profanity allowed!');
    }

    // Check if this is a moderation command
    if (msg.startsWith('/')) {
      handleCommand(socket, msg, isModerator);
    } else {
      // Normal message
      io.emit('chatMessage', `${username}: ${msg}`);
    }
  });

  // On disconnect
  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) {
      io.emit('chatMessage', `${user.username} has left the chat.`);
      users.delete(socket.id);
    }
  });
});

/**
 * Handle moderation commands
 */
function handleCommand(socket, msg, isModerator) {
  const parts = msg.split(' ');
  const command = parts[0].toLowerCase();
  const targetName = parts[1];

  if (!isModerator) {
    return socket.emit('chatMessage', 'You are not a moderator!');
  }

  switch (command) {
    case '/kick':
      kickUser(socket, targetName);
      break;
    case '/ban':
      banUser(socket, targetName);
      break;
    default:
      socket.emit('chatMessage', `Unknown command: ${command}`);
      break;
  }
}

function kickUser(socket, targetName) {
  if (!targetName) {
    return socket.emit('chatMessage', 'Usage: /kick <username>');
  }

  for (const [id, user] of users.entries()) {
    if (user.username.toLowerCase() === targetName.toLowerCase()) {
      io.to(id).emit('chatMessage', 'You have been kicked from the chat.');
      io.sockets.sockets.get(id).disconnect(true);
      io.emit('chatMessage', `${user.username} was kicked by a moderator.`);
      return;
    }
  }
  socket.emit('chatMessage', `User "${targetName}" not found.`);
}

function banUser(socket, targetName) {
  if (!targetName) {
    return socket.emit('chatMessage', 'Usage: /ban <username>');
  }

  for (const [id, user] of users.entries()) {
    if (user.username.toLowerCase() === targetName.toLowerCase()) {
      bannedUsers.add(user.username.toLowerCase());
      io.to(id).emit('chatMessage', 'You have been banned from the chat.');
      io.sockets.sockets.get(id).disconnect(true);
      io.emit('chatMessage', `${user.username} was banned by a moderator.`);
      return;
    }
  }
  bannedUsers.add(targetName.toLowerCase());
  socket.emit('chatMessage', `${targetName} is now banned and will be disconnected if they join.`);
}

// Start server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});





