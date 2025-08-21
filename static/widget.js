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
// Helper: fade element in/out
// -------------------------------
function fadeOut(element, duration = 500) {
  element.style.transition = `opacity ${duration}ms`;
  element.style.opacity = 0;
  return new Promise(resolve => setTimeout(() => {
    element.style.display = "none";
    resolve();
  }, duration));
}

function fadeIn(element, duration = 500, display = "block") {
  element.style.display = display;
  element.style.opacity = 0;
  element.style.transition = `opacity ${duration}ms`;
  setTimeout(() => element.style.opacity = 1, 10);
}

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
      await fadeOut(leadForm, 500);
      fadeIn(thankyouMsg, 500);
      setTimeout(async () => {
        await fadeOut(thankyouMsg, 500);
        fadeIn(chatWindow, 500);
        appendMessage("Hello! How can I help you today?", "bot");
      }, 1500);
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
async function sendMessage() {
  const message = msgInput.value.trim();
  if (!message) return;

  appendMessage(message, "user");
  msgInput.value = "";

  // Typing indicator
  const typing = document.createElement("div");
  typing.classList.add("chat-message", "bot");
  typing.textContent = "Bot is typing...";
  chatBox.appendChild(typing);
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    const response = await fetch(`${FLASK_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    const data = await response.json();
    typing.remove();

    if (data && data.docs && data.docs.length > 0) {
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
    typing.remove();
    appendMessage("Failed to get response from bot.", "bot");
  }
}

// -------------------------------
// Send button & Enter key
// -------------------------------
sendBtn.addEventListener("click", sendMessage);
msgInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});
