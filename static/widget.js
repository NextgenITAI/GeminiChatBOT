document.addEventListener("DOMContentLoaded", () => {
  const leadForm = document.getElementById("lead-form");
  const chatWindow = document.getElementById("chat-window");
  const thankYouMsg = document.getElementById("thankyou-msg");
  const submitBtn = document.getElementById("submit-lead");
  const sendBtn = document.getElementById("send-btn");
  const messages = document.getElementById("messages");
  const input = document.getElementById("user-input");

  submitBtn.addEventListener("click", () => {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    if (!name || !email || !phone) {
      alert("Please fill all fields");
      return;
    }
    thankYouMsg.classList.remove("hidden");
    leadForm.classList.add("hidden");
    chatWindow.classList.remove("hidden");
    // TODO: POST lead to backend
  });

  sendBtn.addEventListener("click", () => {
    const text = input.value.trim();
    if (!text) return;
    const userMsg = document.createElement("div");
    userMsg.textContent = `You: ${text}`;
    messages.appendChild(userMsg);
    input.value = "";
    const botMsg = document.createElement("div");
    botMsg.textContent = "Bot: [response will appear here]";
    messages.appendChild(botMsg);
    messages.scrollTop = messages.scrollHeight;
  });
});
