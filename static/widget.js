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
// Lead form submission with preflight and error handling
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
// Chat message sending with preflight, placeholder removal, formatting
// -------------------------------
sendBtn.addEventListener("click", async () => {
  const message = msgInput.value.trim();
  if (!message) return;

  appendMessage(message, "user");
  msgInput.value = "";

  // Add placeholder
  appendMessage("Bot is thinking...", "bot");

  try {
    const response = await fetch(`${FLASK_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    const data = await response.json();

    // Remove the placeholder "Bot is thinking..."
    const placeholders = chatBox.getElementsByClassName("bot");
    if (placeholders.length) placeholders[placeholders.length - 1].remove();

    if (data && data.docs && data.docs.length > 0) {
      // Format Email and Mobile nicely
      const formattedReply = data.docs.map(d => {
        return d
          .replace(/Email:\s*(\S+)/i, "✉️ Email: $1")
          .replace(/Mob(?:ile)?:\s*(\S+)/i, "📞 Mobile: $1");
      }).join("\n\n");
      appendMessage(formattedReply, "bot");
    } else {
      appendMessage("Bot did not return any data.", "bot");
    }
  } catch (err) {
    console.error("Chat failed:", err);
    appendMessage("Failed to get response from bot.", "bot");
  }
});
