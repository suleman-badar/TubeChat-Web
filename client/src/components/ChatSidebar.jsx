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
    <aside className="flex h-full w-full flex-col bg-tc-bg-2/60 px-4 py-4 text-tc-text">

      <div className="mb-4 flex cursor-pointer items-center gap-2 px-1 py-1" onClick={() => navigate("/")}>
        <h2 className="text-lg font-semibold tracking-tight text-tc-text">TubeChat</h2>
      </div>

      <button
        type="button"
        className="inline-flex items-center justify-center rounded-2xl bg-tc-accent px-4 py-3 font-semibold text-[#1a0f05] shadow-[0_16px_34px_-16px_rgba(239,138,59,0.7)] transition hover:brightness-110"
        onClick={() => navigate("/video/index")}
      >
        + Index Video
      </button>

      <div className="my-4 h-px bg-tc-border" />


      <div className="rounded-2xl border border-tc-border bg-tc-surface/60 p-4">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-tc-muted-2">Current Video</span>

        <strong className="mt-2 block text-tc-text">
          {youtubeId || "No video selected"}
        </strong>
      </div>

      {youtubeId && (
        <button
          type="button"
          className="mt-4 inline-flex items-center justify-center rounded-2xl bg-tc-accent px-4 py-3 font-semibold text-[#1a0f05] shadow-[0_16px_34px_-16px_rgba(239,138,59,0.7)] transition hover:brightness-110"
          onClick={onNewChat}
        >
          + New Chat
        </button>
      )}

      <div className="my-4 h-px bg-tc-border" />

      <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-tc-muted-2">Chats</h3>

      {sessions?.length === 0 ? (
        <p className="mt-3 text-sm text-tc-muted-2">
          No conversations yet.
        </p>
      ) : (
        <div className="mt-3 flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">

          {sessions?.map((session) => {

            const active =
              currentSessionId === session.id;

            return (
              <button
                key={session.id}
                type="button"
                className={
                  active
                    ? "mt-2 w-full rounded-xl border border-tc-accent/40 bg-tc-accent/10 p-3 text-left text-tc-text"
                    : "mt-2 w-full rounded-xl border border-transparent bg-transparent p-3 text-left text-tc-muted transition hover:border-tc-border hover:bg-tc-surface hover:text-tc-text"
                }
                onClick={() =>
                  onSessionClick(session.id)
                }
              >
                <div className="font-medium">
                  {session.title}
                </div>

                <div className="mt-1 text-[11px] text-tc-muted-2">
                  {formatDate(session.updated_at)}
                </div>
              </button>
            );
          })}
        </div>
      )}
      <div className="mt-auto border-t border-tc-border pt-4">
        {/* {console.log("User in sidebar:", user)} */}
        {user ? (
          <>
            <span className="block break-all text-sm text-tc-muted">{user.email}</span>
            <button type="button" className="mt-2 text-left text-sm font-medium text-tc-accent hover:underline" onClick={logout}>
              Log out
            </button>
          </>
        ) : (
          <Link to="/login" className="text-sm font-medium text-tc-accent hover:underline">Log in / Sign up</Link>
        )}
      </div>
    </aside>
  );
}