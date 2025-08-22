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
// Public Flask endpoint (ngrok URL)
// -------------------------------
const FLASK_URL = "https://4c12c742f2aa.ngrok-free.app"; // Use your ngrok URL

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
// Preflight / CORS helper
// -------------------------------
async function preflightCheck(url, method) {
  try {
    const response = await fetch(url, {
      method: "OPTIONS",
      headers: { "Content-Type": "application/json" }
    });
    if (!response.ok) {
      console.warn(`Preflight check failed for ${method} ${url}`);
    }
  } catch (err) {
    console.error(`Preflight request failed for ${method} ${url}:`, err);
  }
}

// -------------------------------
// Lead form submission
// -------------------------------
leadForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const lead = {
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    phone: phoneInput.value.trim()
  };

  if (!lead.name || !lead.email || !lead.phone) {
    alert("Please fill in all lead fields.");
    return;
  }

  await preflightCheck(`${FLASK_URL}/submit_lead`, "POST");

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
      console.error("Lead save error:", result);
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
  if (!message) {
    alert("Please type a message before sending.");
    return;
  }

  appendMessage(message, "user");
  msgInput.value = "";
  appendMessage("Bot is thinking...", "bot");

  await preflightCheck(`${FLASK_URL}/chat`, "POST");

  try {
    const response = await fetch(`${FLASK_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data = await response.json();

    // Remove "Bot is thinking..."
    const lastBotMsg = chatBox.querySelector(".chat-message.bot:last-child");
    if (lastBotMsg && lastBotMsg.textContent === "Bot is thinking...") {
      lastBotMsg.remove();
    }

    if (data.status === "error") {
      appendMessage("Error: " + data.message, "bot");
      console.error("Bot error:", data.message);
    } else {
      const formattedReply = data.answer
        .replace(/Email:\s*(\S+)/i, "✉️ Email: $1")
        .replace(/Phone:\s*(\S+)/i, "📞 Phone: $1");
      appendMessage(formattedReply, "bot");
      console.info("Bot reply:", formattedReply);
    }
  } catch (err) {
    console.error("Chat failed:", err);
    appendMessage("Failed to get response from bot.", "bot");
  }
});

// -------------------------------
// Press Enter to send
// -------------------------------
msgInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendBtn.click();
});
