import { useNavigate, Link } from "react-router";
import {
  Home,
  Sparkles,
  LogOut,
  LogIn,
  ChevronRight,
} from "lucide-react";

import { useAuth } from "../contexts/AppContext";

export function NavRail({ youtubeId }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const meta = null;

  return (
    <div className="flex h-full w-full flex-col bg-tc-bg-2/60">
      {/* Account */}
      <div className="px-3 pt-4">
        <div className="flex items-center gap-2.5 rounded-xl border border-tc-border bg-tc-surface/60 p-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-tc-accent/15 text-[13px] text-tc-accent">
            {user ? user.email.charAt(0).toUpperCase() : "G"}
          </span>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] text-tc-text">
              {user ? user.email.split("@")[0] : "Guest"}
            </p>

            <p className="truncate text-[11px] text-tc-muted-2">
              {user ? "Signed in" : "Not signed in"}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-3 pt-4">
        <p className="px-2 pb-1.5 text-[11px] uppercase tracking-wider text-tc-muted-2">
          Navigate
        </p>

        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex w-full items-center gap-2.5 rounded-lg bg-tc-surface-2/80 px-2.5 py-2 text-[13px] text-tc-text"
        >
          <Home className="h-4 w-4 text-tc-accent" strokeWidth={2} />
          Home
        </button>
      </nav>

      {/* Active workspace */}
      <div className="px-3 pt-4">
        <p className="px-2 pb-1.5 text-[11px] uppercase tracking-wider text-tc-muted-2">
          Workspace
        </p>

        <button
          type="button"
          onClick={() =>
            youtubeId && navigate(`/chat?youtube_id=${youtubeId}`)
          }
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] text-tc-muted transition-colors hover:bg-tc-surface hover:text-tc-text"
        >
          <Home
            className="h-4 w-4 shrink-0 text-tc-error/80"
            strokeWidth={2}
          />
          <span className="truncate">
            {meta ? meta.title : "No video"}
          </span>
        </button>
      </div>

      <div className="flex-1" />

      {/* Plan card */}
      <div className="px-3 pb-3">
        <div className="rounded-xl border border-tc-border bg-gradient-to-b from-tc-surface-2 to-tc-surface p-3.5">
          <p className="text-[11px] uppercase tracking-wider text-tc-muted-2">
            Current plan
          </p>

          <div className="mt-1 flex items-center gap-2">
            <Sparkles
              className="h-4 w-4 text-tc-accent-2"
              strokeWidth={2}
            />
            <span className="text-[15px] text-tc-text">Free</span>
          </div>

          <p className="mt-1.5 text-[12px] leading-snug text-tc-muted-2">
            2 daily queries. Unlock unlimited chats and longer videos.
          </p>

          <button
            type="button"
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-tc-accent/40 bg-tc-accent/10 px-3 py-2 text-[13px] text-tc-accent transition-colors hover:bg-tc-accent/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-tc-accent"
          >
            Upgrade to Pro
            <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.2} />
          </button>
        </div>
      </div>

      {/* Auth */}
      <div className="border-t border-tc-border p-3">
        {user ? (
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] text-tc-muted transition-colors hover:bg-tc-surface hover:text-tc-error"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.9} />
            Log out
          </button>
        ) : (
          <Link
            to="/login"
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] text-tc-muted transition-colors hover:bg-tc-surface hover:text-tc-text"
          >
            <LogIn className="h-4 w-4" strokeWidth={1.9} />
            Log in / Sign up
          </Link>
        )}
      </div>
    </div>
  );
}