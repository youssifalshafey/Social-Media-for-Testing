const socket = io();

const form = document.getElementById('form');
const input = document.getElementById('input');
const submit = document.getElementById('btnValue');
const container = document.querySelector('.class_form');

let replyingTo = null;

// Handle welcome message
socket.on('user-name', (msg) => {
    container.innerHTML += `
    <div id="welcome">
        <h2 class="welcome">Welcome ${msg.trim()} to the chat room</h2>
    </div>`;
});

// Handle form submission
submit.addEventListener('click', (e) => {
    e.preventDefault();
    if (input.value) {
        // Emit message with reply information if applicable
        socket.emit('user-input', {
            message: input.value,
            replyTo: replyingTo
        });
        input.value = '';
        replyingTo = null; // Reset reply state
        updateReplyIndicator();
    }
});



socket.on('message-back', (msg) => {
    socket.emit('receive-message', msg);
});

socket.on('user-name', (msg) => {
    container.innerHTML += `<div id='connect'>${msg}</div>`;
});

socket.on('user-name', (msgCh) => {
    socket.on('receive-message', (user, msg) => {
        const currentId = user === msgCh;
        const id = currentId ? 'me' : 'other';
        const messageId = `msg_${Date.now()}`; 
        const replyContent = msg.replyTo ? 
            `<div class="reply-reference" data-reply-id="${msg.replyTo}">
                <span>Replying to: ${getMessageContent(msg.replyTo)}</span>
            </div>` : '';

        container.innerHTML += `
        <div id="${id}" class="message-container" data-message-id="${messageId}">
            ${replyContent}
            <div class="messageYou">${user}</div>
            <div class="message">${msg.message}</div>
            <button class="reply-btn" onclick="startReply('${messageId}')">Reply</button>
        </div>`;

        container.scrollTop = container.scrollHeight; // Scroll to the bottom
    });
});

// Handle disconnection messages
socket.on('disconnect-msg', (msg) => {
    container.innerHTML += `<div id='disconnect'>${msg}</div>`;
});

// replay

function startReply(messageId) {
    replyingTo = messageId;
    updateReplyIndicator();
}

function updateReplyIndicator() {
    const replyIndicator = document.getElementById('reply-indicator') || 
        document.createElement('div');
    replyIndicator.id = 'reply-indicator';
    
    if (replyingTo) {
        replyIndicator.innerHTML = `
            Replying to: ${getMessageContent(replyingTo)}
            <button onclick="cancelReply()">Cancel</button>
        `;
        form.insertBefore(replyIndicator, input);
    } else {
        replyIndicator.remove();
    }
}

function cancelReply() {
    replyingTo = null;
    updateReplyIndicator();
}

function getMessageContent(messageId) {
    const messageElement = document.querySelector(`[data-message-id="${messageId}"] .message`);
    return messageElement ? messageElement.textContent.substring(0, 30) + '...' : 'Message';
}