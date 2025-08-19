document.addEventListener("DOMContentLoaded", function() {
  const submitBtn = document.getElementById("submit-lead");
  const thankYouMsg = document.getElementById("thankyou-msg");
  const leadForm = document.getElementById("lead-form");
  const chatWindow = document.getElementById("chat-window");

  submitBtn.addEventListener("click", function() {
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;

    if(name && email && phone){
      // For now, just show thank you message
      thankYouMsg.classList.remove("hidden");
      leadForm.classList.add("hidden");
      chatWindow.classList.remove("hidden");

      // Later: send POST request to Python backend
    } else {
      alert("Please fill all fields!");
    }
  });

  const sendBtn = document.getElementById("send-btn");
  sendBtn.addEventListener("click", function() {
    const userInput = document.getElementById("user-input").value;
    if(userInput){
      const messages = document.getElementById("messages");
      const msg = document.createElement("div");
      msg.textContent = "You: " + userInput;
      messages.appendChild(msg);
      document.getElementById("user-input").value = "";

      // Later: call backend RAG + LLM for answer
      const botMsg = document.createElement("div");
      botMsg.textContent = "Bot: This will be replaced by LLM answer";
      messages.appendChild(botMsg);
    }
  });
});
