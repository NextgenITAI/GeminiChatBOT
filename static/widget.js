// Submit lead
document.getElementById('submit-lead').onclick = async (event) => {
  event.preventDefault(); // Prevent default form submission
  console.log('Submit button clicked'); // Debug log

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();

  if (!name || !email || !phone) {
    alert('Please fill all fields');
    return;
  }

  try {
    console.log('Sending fetch request to /submit-lead'); // Debug log
    const res = await fetch('/submit-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone })
    });
    const data = await res.json();
    console.log('Response received:', data); // Debug log

    if (res.ok) {
      // Show thank-you message
      const thankyouMsg = document.getElementById('thankyou-msg');
      thankyouMsg.textContent = data.message;
      thankyouMsg.classList.remove('hidden');
      console.log('Thank-you message displayed'); // Debug log

      // Smooth transition to chat
      setTimeout(() => {
        const leadForm = document.getElementById('lead-form');
        const chatWindow = document.getElementById('chat-window');
        leadForm.classList.add('fade-out');
        setTimeout(() => {
          leadForm.classList.add('hidden');
          leadForm.classList.remove('fade-out');
          chatWindow.classList.remove('hidden');
          chatWindow.classList.add('fade-in');
          setTimeout(() => chatWindow.classList.remove('fade-in'), 500); // Match CSS transition
          console.log('Transition to chat window completed'); // Debug log
        }, 500); // Match CSS transition duration
      }, 2000); // 2-second delay for thank-you message
    } else {
      alert('Error: ' + data.message);
    }
  } catch (error) {
    console.error('Fetch error:', error);
    alert('Failed to submit lead. Check console for details.');
  }
};

// Chat send button
document.getElementById('send').onclick = () => {
  const msgInput = document.getElementById('msg');
  const msg = msgInput.value.trim();
  if (!msg) return;

  const chatBox = document.getElementById('chat-box');
  chatBox.innerHTML += `<div class="msg me">${msg}</div>`;
  chatBox.scrollTop = chatBox.scrollHeight;
  msgInput.value = '';

  // Bot response placeholder
  setTimeout(() => {
    chatBox.innerHTML += `<div class="msg bot">I am ready to answer your questions!</div>`;
    chatBox.scrollTop = chatBox.scrollHeight;
  }, 500);
};
