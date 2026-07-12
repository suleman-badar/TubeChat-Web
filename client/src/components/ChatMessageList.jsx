export function ChatMessageList({ messages }) {
    return (
        <div className="message-list" aria-live="polite">
            {messages.length === 0 ? (
                <div className="empty-state">
                    <h3>Start the conversation</h3>
                    <p>Ask a question about the video transcript and the answer will appear here.</p>
                </div>
            ) : null}

            {messages.map((message, index) => (
                <article
                    key={`${message.role}-${index}`}
                    className={message.role === 'user' ? 'message user-message' : 'message assistant-message'}
                >
                    <span className="message-role">{message.role === 'user' ? 'You' : 'Bot'}</span>
                    <p>{message.content}</p>
                </article>
            ))}
        </div>
    )
}