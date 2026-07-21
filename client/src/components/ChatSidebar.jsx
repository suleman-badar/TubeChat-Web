function formatDate(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);

  return date.toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function ChatSidebar({
  youtubeId,
  sessions,
  currentSessionId,
  onSessionClick,
  onNewChat,
}) {
  return (
    console.log("YOUTUBE ID IN SIDEBAR", youtubeId),
    <aside className="panel chat-sidebar">

      <h2>Video Chat</h2>

      <div className="info-block">
        <span className="info-label">Current Video</span>

        <strong>
          {youtubeId || "No video selected"}
        </strong>
      </div>

      {youtubeId && (
        <button
          type="button"
          className="primary-button"
          onClick={onNewChat}
        >
          + New Chat
        </button>
      )}

      <hr />

      <h3>Chats</h3>

      {sessions?.length === 0 ? (
        <p className="empty-sidebar">
          No conversations yet.
        </p>
      ) : (
        <div className="chat-session-list">

          {sessions?.map((session) => {

            const active =
              currentSessionId === session.id;

            return (
              <button
                key={session.id}
                type="button"
                className={
                  active
                    ? "chat-session active"
                    : "chat-session"
                }
                onClick={() =>
                  onSessionClick(session.id)
                }
              >
                <div className="chat-session-title">
                  {session.title}
                </div>

                <div className="chat-session-date">
                  {formatDate(session.updated_at)}
                </div>
              </button>
            );
          })}
        </div>
      )}

    </aside>
  );
}