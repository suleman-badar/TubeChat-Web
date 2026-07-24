import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AppContext"
import { Link } from "react-router-dom";

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
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="panel chat-sidebar">

      <div className="sidebar-brand" onClick={() => navigate("/")}>
        <h2 className="brand-text">TubeChat</h2>
      </div>

      <button
        type="button"
        className="nav-btn primary index-video-btn"
        onClick={() => navigate("/video/index")}
      >
        + Index Video
      </button>

      <hr />


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
      <div className="sidebar-auth">
        {/* {console.log("User in sidebar:", user)} */}
        {user ? (
          <>
            <span className="sidebar-user-email">{user.email}</span>
            <button type="button" className="text-link" onClick={logout}>
              Log out
            </button>
          </>
        ) : (
          <Link to="/login" className="text-link">Log in / Sign up</Link>
        )}
      </div>
    </aside>
  );
}