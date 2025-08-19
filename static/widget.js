// Grab elements
const leadForm = document.getElementById("lead-form-submit");
const chatWindow = document.getElementById("chat-window");
const chatBox = document.getElementById("chat-box");
const submitLeadBtn = document.getElementById("submit-lead");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const msgInput = document.getElementById("msg");
const sendBtn = document.getElementById("send");

// Append message to chat
function appendMessage(text, sender = "bot") {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("chat-message", sender);
  msgDiv.textContent = text;
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight; // auto scroll
}

// Lead form submission
leadForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const lead = {
    name: nameInput.value,
    email: emailInput.value,
    phone: phoneInput.value
  };

  leadForm.classList.add("hidden");
  chatWindow.classList.remove("hidden");
  appendMessage("Hello! How can I assist you today?");
});

// Send message
sendBtn.addEventListener("click", () => {
  const message = msgInput.value.trim();
  if (message) {
    appendMessage(message, "user");
    msgInput.value = "";
    setTimeout(() => appendMessage("This is a sample bot response."), 500);
  }
});
