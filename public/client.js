// client.js
const socket = io();

// Get DOM elements
const chatWindow = document.getElementById('chat-window');
const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');
const emojiBtn = document.getElementById('emoji-btn');

// Set up emoji picker (using @joeattardi/emoji-button)
const picker = new EmojiButton({
  position: 'top-start'
});

picker.on('emoji', emoji => {
  // Append the chosen emoji to the input
  messageInput.value += emoji;
});

// Toggle emoji picker on button click
emojiBtn.addEventListener('click', () => {
  picker.togglePicker(emojiBtn);
});

// Listen for form submission
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = messageInput.value.trim();
  if (message) {
    socket.emit('chatMessage', message);
    messageInput.value = '';
    messageInput.focus();
  }
});

// Listen for incoming chat messages
socket.on('chatMessage', (msg) => {
  const msgDiv = document.createElement('div');
  msgDiv.textContent = msg;
  chatWindow.appendChild(msgDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
});
