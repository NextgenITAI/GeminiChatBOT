document.addEventListener("DOMContentLoaded", () => {
  // Grab elements
  const leadForm = document.getElementById("lead-form");
  const chatWindow = document.getElementById("chat-window");
  const chatBox = document.getElementById("chat-box");
  const thankyouMsg = document.getElementById("thankyou-msg");
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");
  const msgInput = document.getElementById("msg");
  const sendBtn = document.getElementById("send");

  // Flask endpoint
  const FLASK_URL = "https://4c12c742f2aa.ngrok-free.app";

  // Append message
  function appendMessage(text, sender = "bot") {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("chat-message", sender);
    msgDiv.textContent = text;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  // Lead form
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

  // Chat send
  sendBtn.addEventListener("click", async () => {
    const message = msgInput.value.trim();
    if (!message) {
      alert("Please type a message before sending.");
      return;
    }

    appendMessage(message, "user");
    msgInput.value = "";
    appendMessage("Bot is thinking...", "bot");

    try {
      const response = await fetch(`${FLASK_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });

      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const data = await response.json();

      if (data.status === "error") {
        appendMessage("Error: " + data.message, "bot");
        console.error("Bot error:", data.message);
      } else {
        const formattedReply = data.answer
          .replace(/Email:\s*(\S+)/gi, "✉️ Email: $1")
          .replace(/Phone:\s*(\S+)/gi, "📞 Phone: $1");
        appendMessage(formattedReply, "bot");
        console.info("Bot reply:", formattedReply);
      }
    } catch (err) {
      console.error("Chat failed:", err);
      appendMessage("Failed to get response from bot.", "bot");
    } finally {
      // Always remove thinking message
      const thinkingMsg = chatBox.querySelector(".chat-message.bot:last-child");
      if (thinkingMsg && thinkingMsg.textContent === "Bot is thinking...") {
        thinkingMsg.remove();
      }
    }
  });

  // Press Enter to send
  msgInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendBtn.click();
  });
});
