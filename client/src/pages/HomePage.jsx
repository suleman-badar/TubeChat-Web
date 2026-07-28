import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRecentChatSessions } from "../services/api";
import { useAuth } from "../contexts/AppContext";

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function HomePage({ navigate }) {
  const { user } = useAuth();
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
  }, [user]);

  return (
    <div className="h-full w-full overflow-y-auto bg-tc-bg px-4 py-6 text-tc-text sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <section className="overflow-hidden rounded-3xl border border-tc-border bg-gradient-to-br from-tc-surface/95 via-tc-surface to-tc-bg-2/85 p-6 shadow-[0_28px_90px_-40px_rgba(0,0,0,0.9)] sm:p-8 lg:p-10">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-tc-accent-2">YouTube Chatbot</p>
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-tc-text sm:text-5xl lg:text-6xl">Interact with any YouTube Video</h1>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-tc-muted sm:text-base">
          Submit a video link, extract its transcript dynamically and ask questions contextually using AI.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-2xl bg-tc-accent px-5 py-3 font-semibold text-[#1a0f05] shadow-[0_16px_34px_-16px_rgba(239,138,59,0.7)] transition hover:brightness-110"
            onClick={() => navigate("/video/index")}
          >
            Index New Video
          </button>
        </div>
      </section>

      {!user && (
        <div className="rounded-2xl border border-tc-border bg-tc-surface/65 px-4 py-3 text-center text-sm text-tc-muted">
          <p>
            Using as Guest. <Link to="/login" className="font-medium text-tc-accent hover:underline">Log in</Link> to save and access your conversation history across devices!
          </p>
        </div>
      )}

      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-tc-muted-2">Recent Conversations</h3>
        {isLoading ? (
          <p className="text-sm text-tc-muted">Loading past chats...</p>
        ) : error ? (
          <p className="text-sm text-tc-error">{error}</p>
        ) : recentSessions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-tc-border px-5 py-10 text-center text-sm text-tc-muted">
            <p className="mx-auto max-w-xl">
              {user
                ? "No recent sessions found. Index a video to start chatting!"
                : "Log in to view saved chat sessions, or index a video to start chatting as guest."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {recentSessions.map((session) => (
              <div
                key={session.id}
                className="group cursor-pointer rounded-2xl border border-tc-border bg-tc-surface/70 p-4 shadow-[0_20px_60px_-34px_rgba(0,0,0,0.85)] transition hover:-translate-y-1 hover:border-tc-border-strong hover:bg-tc-surface/90"
                onClick={() => navigate(`/chat?session_id=${session.id}`)}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-full border border-tc-border bg-tc-bg-2 px-2.5 py-1 text-[11px] font-medium text-tc-muted-2">ID: {session.youtube_id}</span>
                  <span className="text-[11px] text-tc-muted-2">{formatDate(session.updated_at)}</span>
                </div>
                <h4 className="mt-4 line-clamp-2 text-lg font-semibold tracking-tight text-tc-text">{session.title}</h4>
                <div className="mt-5 text-sm font-medium text-tc-accent">Resume chat →</div>
              </div>
            ))}
          </div>
        )}
      </section>
      </div>
    </div>
  );
}