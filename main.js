const url = "http://localhost:11434/api/generate";
const headers = {
    'Content-Type': 'application/json',
};
let conversationHistory = [];

function sendMessage() {
    const prompt = document.getElementById('prompt').value;
    if (!prompt.trim()) return;

    conversationHistory.push(prompt);
    appendMessage(prompt, 'user');
    document.getElementById('prompt').value = '';

    hideInitialImage();

    appendLoadingAnimation();

    const fullPrompt = conversationHistory.join("\n");
    const data = {
        model: "gemma:2b",
        stream: false,
        prompt: fullPrompt,
    };

    fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        removeLoadingAnimation();
        const actualResponse = data.response;
        conversationHistory.push(actualResponse);
        appendMessage(actualResponse, 'bot', true, actualResponse);
    })
    .catch(error => {
        console.error("Error:", error);
        removeLoadingAnimation();
    });
}

function appendMessage(message, sender, isMarkdown = false, originalMarkdown = "") {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('content');

    if (isMarkdown) {
        const md = window.markdownit();
        contentDiv.innerHTML = md.render(message);
        const copyButton = document.createElement('button');
        copyButton.textContent = '🗐';
        copyButton.classList.add('btn1');
        copyButton.onclick = () => copyToClipboard(originalMarkdown); // Pass original Markdown
        contentDiv.appendChild(copyButton);
    } else {
        contentDiv.textContent = message;
        const editButton = document.createElement('button');
        editButton.textContent = '✎';
        editButton.classList.add('btn2');
        editButton.onclick = () => editMessage(message, messageDiv);
        contentDiv.appendChild(editButton);
    }

    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function appendLoadingAnimation() {
    const chatMessages = document.getElementById('chat-messages');
    const loadingDiv = document.createElement('div');
    loadingDiv.classList.add('message', 'bot', 'loading');
    loadingDiv.setAttribute('id', 'loading');
    loadingDiv.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
    chatMessages.appendChild(loadingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeLoadingAnimation() {
    const loadingDiv = document.getElementById('loading');
    if (loadingDiv) {
        loadingDiv.parentNode.removeChild(loadingDiv);
    }
}

function editMessage(message, messageDiv) {
    document.getElementById('prompt').value = message;
    messageDiv.remove();
    const index = conversationHistory.indexOf(message);
    if (index > -1) {
        conversationHistory.splice(index, 1);
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Copied to clipboard!');
    }).catch(err => {
        console.error('Error copying to clipboard', err);
    });
}

function hideInitialImage() {
    const initialImage = document.getElementById('initial-image');
    if (initialImage) {
        initialImage.style.display = 'none';
    }
}