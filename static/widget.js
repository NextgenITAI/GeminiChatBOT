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
// Local Flask endpoint
// -------------------------------
const FLASK_URL = "http://127.0.0.1:8000";

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
leadForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const lead = {
    name: nameInput.value,
    email: emailInput.value,
    phone: phoneInput.value
  };

  try {
    const response = await fetch(`${FLASK_URL}/submit_lead`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead)
    });

    const result = await response.json();
    if (result.status === "success") {
      leadForm.classList.add("hidden");
      thankyouMsg.classList.remove("hidden");

      setTimeout(() => {
        thankyouMsg.classList.add("hidden");
        chatWindow.classList.remove("hidden");
      }, 2000);
    } else {
      alert("Error saving lead: " + result.message);
    }
  } catch (err) {
    console.error("Lead submission failed:", err);
    alert("Failed to submit lead. Check console for details.");
  }
});

// -------------------------------
// Chat message sending
// -------------------------------
sendBtn.addEventListener("click", async () => {
  const message = msgInput.value.trim();
  if (!message) return;

  appendMessage(message, "user");
  msgInput.value = "";

  appendMessage("Bot is thinking...", "bot");

  try {
    const response = await fetch(`${FLASK_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    const data = await response.json();

    if (data.status === "error") {
      appendMessage("Error: " + data.message, "bot");
    } else if (data.docs) {
      // Combine top documents for bot reply
      const reply = data.docs.join("\n\n");
      appendMessage(reply, "bot");
    }
  } catch (err) {
    console.error("Chat failed:", err);
    appendMessage("Failed to get response from bot.", "bot");
  }
});
