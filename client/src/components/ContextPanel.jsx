import { useNavigate } from "react-router";
import {
  Plus,
  MessageSquare,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useAuth } from "../contexts/AppContext";

function formatDate(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);
  const mins = Math.floor((Date.now() - date.getTime()) / 60000);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;

  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;

  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}

export function ContextPanel({
  youtubeId,
  sessions,
  currentSessionId,
  onSessionClick,
  onNewChat,
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const meta = null

  const trialUsed = Math.min(sessions.length, 2);

  return (
    <div className="flex h-full w-full flex-col bg-tc-bg-2/40">
      {/* Section header */}
      <div className="flex items-center justify-between border-b border-tc-border px-4 py-3">
        <div>
          <h2 className="text-[14px] text-tc-text">Video Indexing</h2>
          <p className="text-[11px] text-tc-muted-2">
            Transcript knowledge base
          </p>
        </div>

        <span className="flex items-center gap-1 rounded-full bg-tc-accent-3/10 px-2 py-0.5 text-[11px] text-tc-accent-3">
          <CheckCircle2 className="h-3 w-3" strokeWidth={2.2} />
          Indexed
        </span>
      </div>

      {/* Video card */}
      <div className="p-4">
        <div className="overflow-hidden rounded-xl border border-tc-border bg-tc-surface/70">
          <div className="flex items-center justify-center bg-gradient-to-br from-tc-surface-2 to-tc-bg-3 py-6">
            <Plus
              className="h-8 w-8 text-tc-error/80"
              strokeWidth={1.8}
            />
          </div>

          <div className="p-3">
            <p className="line-clamp-2 text-[13px] leading-snug text-tc-text">
              {meta ? meta.title : "No video selected"}
            </p>

            {meta ? (
              <p className="mt-1 flex items-center gap-1.5 text-[11px] text-tc-muted-2">
                <span className="truncate">{meta.channel}</span>
                <span className="text-tc-border-strong">•</span>
                <Clock className="h-3 w-3" strokeWidth={2} />
                {meta.duration}
              </p>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate("/video/index")}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-tc-border bg-tc-surface px-3 py-2 text-[13px] text-tc-text transition-colors hover:border-tc-border-strong hover:bg-tc-surface-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-tc-accent"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2.2} />
          Index another video
        </button>

        {/* Trial limit */}
        {!user ? (
          <div className="mt-3 rounded-lg border border-tc-border bg-tc-bg-3/60 p-3">
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-tc-muted">Trial limit</span>
              <span className="text-tc-muted-2">{trialUsed}/2</span>
            </div>

            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-tc-surface-2">
              <div
                className="h-full rounded-full bg-gradient-to-r from-tc-accent to-tc-accent-2 transition-all"
                style={{ width: `${(trialUsed / 2) * 100}%` }}
              />
            </div>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="mt-2.5 w-full rounded-lg bg-tc-accent px-3 py-1.5 text-[12px] text-[#1a0f05] transition-all hover:brightness-110"
            >
              Log in to use
            </button>
          </div>
        ) : null}
      </div>

      {/* Conversations */}
      <div className="flex min-h-0 flex-1 flex-col border-t border-tc-border px-4 pt-3">
        <div className="flex items-center justify-between pb-2">
          <h3 className="text-[11px] uppercase tracking-wider text-tc-muted-2">
            Conversations
          </h3>

          {youtubeId ? (
            <button
              type="button"
              onClick={onNewChat}
              className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[12px] text-tc-accent transition-colors hover:bg-tc-accent/10"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2.4} />
              New
            </button>
          ) : null}
        </div>

        <div className="tc-scroll -mr-2 flex-1 space-y-1 overflow-y-auto pr-2 pb-4">
          {sessions?.length === 0 ? (
            <div className="rounded-lg border border-dashed border-tc-border px-3 py-5 text-center">
              <MessageSquare
                className="mx-auto h-4 w-4 text-tc-muted-2"
                strokeWidth={1.8}
              />
              <p className="mt-1.5 text-[12px] text-tc-muted-2">
                No conversations yet.
              </p>
            </div>
          ) : (
            sessions?.map((session) => {
              const active = currentSessionId === session.id;

              return (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => onSessionClick(session.id)}
                  className={`group flex w-full items-start gap-2.5 rounded-lg border px-2.5 py-2 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-tc-accent ${
                    active
                      ? "border-tc-accent/40 bg-tc-accent/10"
                      : "border-transparent hover:border-tc-border hover:bg-tc-surface"
                  }`}
                >
                  <MessageSquare
                    className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${
                      active ? "text-tc-accent" : "text-tc-muted-2"
                    }`}
                    strokeWidth={2}
                  />

                  <span className="min-w-0 flex-1">
                    <span
                      className={`line-clamp-1 text-[13px] ${
                        active
                          ? "text-tc-text"
                          : "text-tc-muted group-hover:text-tc-text"
                      }`}
                    >
                      {session.title}
                    </span>

                    <span className="mt-0.5 block text-[11px] text-tc-muted-2">
                      {formatDate(session.updated_at)}
                    </span>
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}