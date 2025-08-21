// -------------------------------
// Grab elements
// -------------------------------
const leadForm = document.getElementById("lead-form");
const chatWindow = document.getElementById("chat-window");
const chatBox = document.getElementById("chat-box");
const thankyouMsg = document.getElementById("thankyou-msg");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const msgInput = document.getElementById("msg");
const sendBtn = document.getElementById("send");

// -------------------------------
// Ngrok endpoint
// -------------------------------
const NGROK_URL = "https://f8a22bf21142.ngrok-free.app";

// -------------------------------
// Append message to chat
// -------------------------------
function appendMessage(text, sender = "bot") {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("chat-message", sender);
  msgDiv.textContent = text;
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight; // auto scroll
}

// -------------------------------
// Lead form submission
// -------------------------------
leadForm.addEventListener("submit", a
