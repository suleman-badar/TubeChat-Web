import { useNavigate } from "react-router";
import { Code2, Home, Database, Menu, LogIn, Zap } from "lucide-react";
import { useAuth } from "../contexts/AppContext";

export function TopBar({ onMenuClick }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-tc-border bg-tc-bg-3/90 px-3 backdrop-blur sm:px-4">
      {/* Brand */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open menu"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-tc-border text-tc-muted transition-colors hover:bg-tc-surface hover:text-tc-text xl:hidden"
        >
          <Menu className="h-4 w-4" strokeWidth={2} />
        </button>

        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-2 rounded-lg px-1.5 py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-tc-accent"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-tc-accent to-tc-accent-2 text-[#1a0f05]">
            <Code2 className="h-4 w-4" strokeWidth={2.4} />
          </span>

          <span className="text-[15px] tracking-tight text-tc-text">
            Tube<span className="text-tc-accent">Chat</span>
            <span className="text-tc-muted-2">.ai</span>
          </span>
        </button>
      </div>

      {/* Center nav pills */}
      <nav className="hidden items-center gap-1 rounded-xl border border-tc-border bg-tc-surface/50 p-1 md:flex">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 rounded-lg bg-tc-surface-2 px-3 py-1.5 text-[13px] text-tc-text"
        >
          <Home className="h-3.5 w-3.5" strokeWidth={2} />
          Home
        </button>

        <button
          type="button"
          onClick={() => navigate("/video/index")}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] text-tc-muted transition-colors hover:bg-tc-surface hover:text-tc-text"
        >
          <Database className="h-3.5 w-3.5" strokeWidth={2} />
          Index
        </button>
      </nav>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        <span className="hidden items-center gap-1.5 rounded-full border border-tc-border px-2.5 py-1 text-[12px] text-tc-muted-2 sm:flex">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              user ? "bg-tc-accent-3" : "bg-tc-muted-2"
            }`}
          />
          {user ? user.email.split("@")[0] : "Anonymous"}
        </span>

        {!user ? (
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="hidden items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] text-tc-muted transition-colors hover:text-tc-text sm:flex"
          >
            <LogIn className="h-3.5 w-3.5" strokeWidth={2} />
            Login
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => navigate("/video/index")}
          className="flex items-center gap-1.5 rounded-lg bg-tc-accent px-3 py-1.5 text-[13px] text-[#1a0f05] shadow-[0_8px_20px_-8px_rgba(239,138,59,0.7)] transition-all hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-tc-accent focus-visible:ring-offset-2 focus-visible:ring-offset-tc-bg-3"
        >
          <Zap className="h-3.5 w-3.5" strokeWidth={2.2} />
          Index Video
        </button>
      </div>
    </header>
  );
}