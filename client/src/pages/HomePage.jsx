import { useEffect, useState } from "react";
import { getRecentChatSessions } from "../services/api";

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function HomePage({ navigate }) {
  const [recentSessions, setRecentSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchSessions() {
      try {
        const data = await getRecentChatSessions();
        setRecentSessions(data);
      } catch (err) {
        console.error("Failed to load recent sessions:", err);
        setError("Could not load recent conversations.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchSessions();
  }, []);

  return (
    <div className="home-container">
      <section className="home-hero">
        <h1>Interact with any YouTube Video</h1>
        <p className="home-subtitle">
          Submit a video link, extract its transcript dynamically and ask questions contextually using AI.
        </p>
        <div className="home-hero-actions">
          <button
            type="button"
            className="primary-button hero-btn"
            onClick={() => navigate("/video/index")}
          >
            Index New Video
          </button>
        </div>
      </section>

      <section className="home-history-section">
        <h3>Recent Conversations</h3>
        {isLoading ? (
          <p className="status-text">Loading past chats...</p>
        ) : error ? (
          <p className="status-text error-text">{error}</p>
        ) : recentSessions.length === 0 ? (
          <div className="empty-history-card">
            <p>No recent sessions found. Index a video to start chatting!</p>
          </div>
        ) : (
          <div className="history-grid">
            {recentSessions.map((session) => (
              <div
                key={session.id}
                className="history-card"
                onClick={() => navigate(`/chat?session_id=${session.id}`)}
              >
                <div className="history-card-header">
                  <span className="video-badge">ID: {session.youtube_id}</span>
                  <span className="date-text">{formatDate(session.updated_at)}</span>
                </div>
                <h4 className="history-card-title">{session.title}</h4>
                <div className="history-card-action">
                  <span>Resume Chat →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}