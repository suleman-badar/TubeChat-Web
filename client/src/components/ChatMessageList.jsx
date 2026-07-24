import { useEffect, useRef } from "react";

export function ChatMessageList({ messages, isLoading }) {
  const listEndRef = useRef(null);

  useEffect(() => {
    // Scroll to the bottom spacer smoothly when messages update or loading state changes
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

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
          className={message.role === "user" ? "message user-message" : "message assistant-message"}
        >
          <span className="message-role">{message.role === "user" ? "You" : "Bot"}</span>
          <p>{message.content}</p>
        </article>
      ))}

      {isLoading && (
        <article className="message assistant-message thinking-bubble">
          <span className="message-role">Bot</span>
          <p className="thinking-dots">
            Thinking<span>.</span><span>.</span><span>.</span>
          </p>
        </article>
      )}

      {/* Invisible element at the bottom to scroll to */}
      <div ref={listEndRef} style={{ float: "left", clear: "both" }} />
    </div>
  );
}