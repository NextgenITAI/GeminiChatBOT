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
  const FLASK_URL = "https://4c12c742f2aa.ngrok-free.app"; // change if needed

  // Append message
  function appendMessage(text, sender = "bot") {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("chat-message", sender);
    msgDiv.textContent = text;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  // Append feedback buttons
  function appendFeedbackButtons(answerText) {
    const feedbackDiv = document.createElement("div");
    feedbackDiv.classList.add("feedback-buttons");

    const goodBtn = document.createElement("button");
    goodBtn.textContent = "👍";
    const badBtn = document.createElement("button");
    badBtn.textContent = "👎";

    feedbackDiv.appendChild(goodBtn);
    feedbackDiv.appendChild(badBtn);
    chatBox.appendChild(feedbackDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    // Good feedback → send to backend
    goodBtn.addEventListener("click", async () => {
      await fetch(`${FLASK_URL}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback: "good", answer: answerText })
      });
      feedbackDiv.remove();
    });

    // Bad feedback → send to backend
    badBtn.addEventListener("click", async () => {
      await fetch(`${FLASK_URL}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback: "bad", answer: answerText })
      });
      feedbackDiv.remove();
    });
  }

  // Lead form submit
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
        // Hide form, show thank you
        leadForm.classList.add("hidden");
        thankyouMsg.classList.remove("hidden");

        // After 2 sec, hide thank you and show chat
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

      const raw =
        (typeof data.answer === "string" && data.answer) ||
        (typeof data.final_answer === "string" && data.final_answer) ||
        (typeof data.llm_output === "string" && data.llm_output) ||
        "";

      // Remove "thinking..."
      const thinkingMsg = chatBox.querySelector(".chat-message.bot:last-child");
      if (thinkingMsg && thinkingMsg.textContent === "Bot is thinking...") {
        thinkingMsg.remove();
      }

      if (!raw) {
        appendMessage("Bot did not return an answer.", "bot");
        console.warn("Unexpected payload:", data);
        return;
      }

      if (data.status === "error") {
        appendMessage("Error: " + data.message, "bot");
        console.error("Bot error:", data.message);
      } else {
        const formattedReply = raw
          .replace(/Email:\s*(\S+)/gi, "✉️ Email: $1")
          .replace(/Phone:\s*(\S+)/gi, "📞 Phone: $1");

        appendMessage(formattedReply, "bot");
        appendFeedbackButtons(formattedReply); // add 👍👎 after each bot reply
        console.info("Bot reply:", formattedReply);
      }
    } catch (err) {
      console.error("Chat failed:", err);
      appendMessage("Failed to get response from bot.", "bot");
    }
  });

  // Press Enter to send
  msgInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendBtn.click();
  });
});
