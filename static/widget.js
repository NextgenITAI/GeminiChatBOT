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
    return msgDiv;
  }

  // Append bot reply with feedback buttons
  function appendBotReply(data) {
    const msgDiv = appendMessage(data.final_answer || "No answer.", "bot");

    // Create feedback buttons
    const fbDiv = document.createElement("div");
    fbDiv.classList.add("feedback-buttons");

    const upBtn = document.createElement("button");
    upBtn.textContent = "👍";
    upBtn.classList.add("thumb-up");

    const downBtn = document.createElement("button");
    downBtn.textContent = "👎";
    downBtn.classList.add("thumb-down");

    fbDiv.appendChild(upBtn);
    fbDiv.appendChild(downBtn);
    msgDiv.appendChild(fbDiv);

    // Send feedback
    upBtn.addEventListener("click", async () => {
      await sendFeedback("good", data);
      fbDiv.remove(); // remove after feedback
    });

    downBtn.addEventListener("click", async () => {
      await sendFeedback("bad", data);
      fbDiv.remove(); // remove after feedback
    });
  }

  // Feedback API call
  async function sendFeedback(sentiment, data) {
    try {
      await fetch(`${FLASK_URL}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sentiment,
          question: data.user_question,
          final_answer: data.final_answer,
          rag_output: data.rag_output,
          llm_output: data.llm_output,
          rag_scores: data.rag_scores
        })
      });
      console.log(`Feedback (${sentiment}) sent for:`, data.user_question);
    } catch (err) {
      console.error("Feedback failed:", err);
    }
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
    const thinkingMsg = appendMessage("Bot is thinking...", "bot");

    try {
      const response = await fetch(`${FLASK_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });

      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const data = await response.json();

      // Always remove thinking message
      thinkingMsg.remove();

      if (data.status === "error") {
        appendMessage("Error: " + data.message, "bot");
        console.error("Bot error:", data.message);
      } else {
        // Save the user question for feedback
        data.user_question = message;

        const formattedReply = (data.final_answer || "")
          .replace(/Email:\s*(\S+)/gi, "✉️ Email: $1")
          .replace(/Phone:\s*(\S+)/gi, "📞 Phone: $1");

        data.final_answer = formattedReply;
        appendBotReply(data);
      }
    } catch (err) {
      console.error("Chat failed:", err);
      thinkingMsg.remove();
      appendMessage("Failed to get response from bot.", "bot");
    }
  });

  // Press Enter to send
  msgInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendBtn.click();
  });
});
