// Grab elements
const leadForm = document.getElementById("lead-form");
const chatWindow = document.getElementById("chat-window");
const chatBox = document.getElementById("chat-box");
const submitLeadBtn = document.getElementById("submit-lead");
const thankyouMsg = document.getElementById("thankyou-msg");
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
leadForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const lead = {
    name: nameInput.value,
    email: emailInput.value,
    phone: phoneInput.value
  };

  try {
    // Submit lead to Flask/ngrok
    const response = await fetch("https://f8a22bf21142.ngrok-free.app/submit_lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead)
    });

    const result = await response.json();
    if (result.status === "success") {
      // Hide lead form, show thank-you message
      leadForm.classList.add("hidden");
      thankyouMsg.classList.remove("hidden");

      // Wait 2 seconds, then show chat window
      setTimeout(() => {
        thankyouMsg.classList.add("hidden");
        chatWindow.classList.remove("hidden");
      }, 2000);

    } else {
      alert("Error saving lead: " + result.message);
    }
  } catch (err) {
    alert("Failed to submit lead: " + err.message);
  }
});

// Sending chat messages
sendBtn.addEventListener("click", () => {
  const message = msgInput.value.trim();
  if (!message) return;

  appendMessage(message, "user");
  msgInput.value = "";

  // Here you can add code to call your chatbot API and append bot responses
  appendMessage("Bot is thinking...", "bot");
});
