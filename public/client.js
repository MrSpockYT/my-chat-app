// client.js

import { EmojiButton } from 'https://cdn.jsdelivr.net/npm/@joeattardi/emoji-button@4.6.2/dist/index.js';

// Connect to Socket.IO
const socket = io();

// DOM elements for sign-up
const signupContainer = document.getElementById('signup-container');
const signupForm = document.getElementById('signup-form');
const signupUsername = document.getElementById('signup-username');
const signupPassword = document.getElementById('signup-password');

// DOM elements for chat
const chatContainer = document.getElementById('chat-container');
const chatWindow = document.getElementById('chat-window');
const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');
const emojiBtn = document.getElementById('emoji-btn');

// 1. Handle sign-up (fake login)
signupForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = signupUsername.value.trim();
  const password = signupPassword.value.trim();

  if (!username || !password) {
    alert('Please enter a username and password.');
    return;
  }

  // Hide sign-up, show chat
  signupContainer.style.display = 'none';
  chatContainer.style.display = 'block';

  // Notify server of your chosen username
  socket.emit('join', username);

  // Clear fields
  signupUsername.value = '';
  signupPassword.value = '';
});

// 2. Set up the emoji picker
const picker = new EmojiButton({
  position: 'top-start',
  rootElement: document.body, // ensures the picker is appended at <body> level
});

// Append selected emoji to the input
picker.on('emoji', (selection) => {
  messageInput.value += selection.emoji;
});

// Toggle the picker on button click
emojiBtn.addEventListener('click', () => {
  picker.togglePicker(emojiBtn);
});

// 3. Send chat messages
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = messageInput.value.trim();
  if (message) {
    socket.emit('chatMessage', message);
    messageInput.value = '';
    messageInput.focus();
  }
});

// 4. Receive chat messages
socket.on('chatMessage', (msg) => {
  const msgDiv = document.createElement('div');
  msgDiv.textContent = msg;
  chatWindow.appendChild(msgDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
});


