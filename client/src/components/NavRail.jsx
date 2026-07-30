import { useNavigate, Link } from "react-router";
import { useState } from "react";
import {
  Home,
  Sparkles,
  LogOut,
  LogIn,
  ChevronRight,
  Video,
} from "lucide-react";

import { useAuth } from "../contexts/AppContext";

export function NavRail({ youtubeId, plan }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <div className="flex h-full w-full flex-col bg-tc-bg-2/60">
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
          <Video
            className="h-4 w-4 shrink-0 text-tc-error/80"
            strokeWidth={2}
          />
          <span className="truncate">
            {youtubeId ? youtubeId : "No video selected"}
          </span>
        </button>
      </div>

      <div className="flex-1" />

      {/* Plan card */}
      {
        plan === "free" ? (
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
                onClick={() => navigate("/pricing")}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-tc-accent/40 bg-tc-accent/10 px-3 py-2 text-[13px] text-tc-accent transition-colors hover:bg-tc-accent/20"
              >
                Upgrade to Pro
                <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.2} />
              </button>
            </div>
          </div>
        ) : (
          <div className="px-3 pb-3">
            <div className="rounded-xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/10 to-tc-surface p-3.5">
              <p className="text-[11px] uppercase tracking-wider text-tc-muted-2">
                Current plan
              </p>

              <div className="mt-1 flex items-center gap-2">
                <Sparkles
                  className="h-4 w-4 text-emerald-400"
                  strokeWidth={2}
                />
                <span className="text-[15px] font-medium text-tc-text">
                  TubeChat Pro
                </span>
              </div>

              <p className="mt-1.5 text-[12px] leading-snug text-tc-muted-2">
                You're enjoying unlimited video indexing and unlimited AI conversations.
              </p>

              <div className="mt-3 flex items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-[13px] font-medium text-emerald-400">
                ✓ Pro Plan Active
              </div>
            </div>
          </div>
        )
      }
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