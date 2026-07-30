import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Sparkles, Video, Home, X } from "lucide-react";


import { ChatComposer } from "../components/ChatComposer";
import { ChatMessageList } from "../components/ChatMessageList";
import { TopBar } from "../components/TopBar";
import { NavRail } from "../components/NavRail";
import { ContextPanel } from "../components/ContextPanel";

import { useAuth } from "../contexts/AppContext";

import {
  chatStream,
  getChatSession,
  getVideoChatSessions,
} from "../services/api";

function formatError(error) {
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }
  return error instanceof Error
    ? error.message
    : "Something went wrong.";
}

export function ChatPage({ navigate }) {
  const [searchParams] = useSearchParams();

  const queryYoutubeId = searchParams.get("youtube_id");
  const sessionId = searchParams.get("session_id");

  const [youtubeId, setYoutubeId] = useState(queryYoutubeId);
  const [messages, setMessages] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [plan, setPlan] = useState("Free");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      question: "",
    },
  });

  const { user } = useAuth(); // Access user from AuthContext

  useEffect(() => {
    async function getPlan() {
      try {
        const { data } = await getBillingConfig();
        setPlan(data.plan.toLowerCase());
      } catch (error) {
        console.error("Error fetching billing config:", error);
      }
    }
    getPlan();
  }, []);


  // Sync youtubeId when URL query changes
  useEffect(() => {
    if (queryYoutubeId) {
      setYoutubeId(queryYoutubeId);
    }
  }, [queryYoutubeId]);

  // Load chat session on mount or session change
  useEffect(() => {
    if (!sessionId) {
      setMessages([]);
      return;
    }

    async function loadConversation(id) {
      try {
        const data = await getChatSession(id);
        setMessages(data.messages);
        setYoutubeId(data.session.youtube_id);
      } catch (error) {
        setApiError(formatError(error));
      }
    }

    loadConversation(sessionId);
  }, [sessionId]);



  // Load sidebar conversations when active video changes
  useEffect(() => {
    if (!youtubeId) return;

    async function loadSessions() {
      try {
        const data = await getVideoChatSessions(youtubeId);
        setSessions(data);
      } catch (error) {
        console.error("Failed to load sidebar sessions:", error);
      }
    }
    loadSessions();
  }, [youtubeId, user, sessionId]); // Refresh sidebar when user logged in/out or when video changes



  async function onSubmit({ question }) {
    if (!youtubeId) return;

    setApiError("");
    setIsLoading(true);
    reset(); // Clear input immediately for better immediate UX response

    const userMessage = { role: "user", content: question };
    const assistantMessage = { role: "assistant", content: "" };

    let streamedSessionId = sessionId; // Use the current sessionId if available

    // Add both optimistically — user message now, assistant message as an
    // empty bubble that fills in as tokens arrive.
    setMessages((current) => [...current, userMessage, assistantMessage]);

    let hasNavigated = false;

    await chatStream({
      youtubeId,
      sessionId,
      question,

      onSession: (newSessionId) => {
        streamedSessionId = newSessionId;
      },

      onToken: (answer) => {
        setMessages((current) => {
          const updated = [...current];
          const lastIndex = updated.length - 1;
          updated[lastIndex] = {
            ...updated[lastIndex],
            content: updated[lastIndex].content + answer,
          };
          return updated;
        });
      },

      onDone: () => {
        setIsLoading(false);
        if(!sessionId && streamedSessionId && !hasNavigated) {
          hasNavigated = true;
          navigate(`/chat?session_id=${streamedSessionId}`);
        }
      },

      onError: (message) => {
        setApiError(message);
        setIsLoading(false);
        // Remove both optimistic messages (user + empty/partial assistant)
        // on failure, so state reflects database truth.
        setMessages((current) => current.slice(0, -2));
      },
    });
  }

  function handleSessionClick(id) {
    navigate(`/chat?session_id=${id}`);
  }

  function handleNewChat() {
    if (!youtubeId) return;
    setMessages([]);
    navigate(`/chat?youtube_id=${youtubeId}`);
  }

  // Handle case where user navigates directly to /chat with no target
  if (!youtubeId && !sessionId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-tc-bg px-4 py-6 text-tc-text sm:px-6 lg:px-8">
        <div className="w-full max-w-md rounded-3xl border border-tc-border bg-tc-surface/80 p-8 text-center shadow-[0_28px_90px_-40px_rgba(0,0,0,0.9)] backdrop-blur">
          <h2 className="text-2xl font-semibold tracking-tight text-tc-text">No Video Selected</h2>
          <p className="mt-3 text-sm leading-relaxed text-tc-muted">Please index a new video or choose a recent conversation from the home page to start chatting.</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              className="inline-flex flex-1 items-center justify-center rounded-2xl bg-tc-accent px-4 py-3 font-semibold text-[#1a0f05] shadow-[0_16px_34px_-16px_rgba(239,138,59,0.7)] transition hover:brightness-110"
              onClick={() => navigate("/video/index")}
            >
              Index Video
            </button>
            <button
              type="button"
              className="inline-flex flex-1 items-center justify-center rounded-2xl border border-tc-border bg-tc-surface-2 px-4 py-3 font-semibold text-tc-text transition hover:border-tc-border-strong hover:bg-tc-surface"
              onClick={() => navigate("/")}
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const noTarget = !youtubeId && !sessionId;
  const meta = null; // Placeholder for video metadata, can be fetched if needed

  return (
  <div className="flex h-full w-full flex-col overflow-hidden bg-tc-bg text-tc-text">
      <TopBar onMenuClick={() => setDrawerOpen(true)} />

    <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Nav rail — desktop */}
        <div className="hidden w-60 shrink-0 border-r border-tc-border xl:block">
          <NavRail youtubeId={youtubeId} plan={plan} />
        </div>

        {/* Context panel — desktop */}
        <div className="hidden w-72 shrink-0 border-r border-tc-border lg:block">
          <ContextPanel
            youtubeId={youtubeId}
            sessions={sessions}
            currentSessionId={sessionId}
            onSessionClick={handleSessionClick}
            onNewChat={handleNewChat}
          />
        </div>

        {/* Mobile drawer: rail + context panel stacked */}
        {drawerOpen ? (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setDrawerOpen(false)}
            />
            <div className="absolute inset-y-0 left-0 flex w-[88%] max-w-[340px] flex-col border-r border-tc-border bg-tc-bg-2 shadow-2xl">
              <div className="flex items-center justify-between border-b border-tc-border px-4 py-3">
                <span className="text-[13px] text-tc-muted">Menu</span>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close menu"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-tc-muted-2 hover:bg-tc-surface hover:text-tc-text"
                >
                  <X className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
              <div className="flex min-h-0 flex-1 flex-col overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <div className="shrink-0 border-b border-tc-border pb-2">
                  <NavRail youtubeId={youtubeId} />
                </div>
                <div className="min-h-[420px] flex-1">
                  <ContextPanel
                    youtubeId={youtubeId}
                    sessions={sessions}
                    currentSessionId={sessionId}
                    onSessionClick={handleSessionClick}
                    onNewChat={handleNewChat}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Chat panel */}
        <section className="flex min-w-0 flex-1 flex-col overflow-hidden bg-tc-bg">
          {noTarget ? (
            <div className="flex flex-1 items-center justify-center px-4 py-10">
              <div className="w-full max-w-md rounded-2xl border border-tc-border bg-tc-surface/70 p-8 text-center shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)]">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-tc-accent/15 text-tc-accent">
                  <Sparkles className="h-6 w-6" strokeWidth={1.8} />
                </div>
                <h2 className="text-xl text-tc-text">No video selected</h2>
                <p className="mt-2 text-sm leading-relaxed text-tc-muted">
                  Index a new video or choose a recent conversation to start
                  chatting.
                </p>
                <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => navigate("/video/index")}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-tc-accent px-4 py-2.5 text-sm text-[#1a0f05] transition-all hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-tc-accent focus-visible:ring-offset-2 focus-visible:ring-offset-tc-bg"
                  >
                    <Video className="h-4 w-4" strokeWidth={2.1} />
                    Index video
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-tc-border bg-tc-surface px-4 py-2.5 text-sm text-tc-text transition-colors hover:bg-tc-surface-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-tc-accent"
                  >
                    <Home className="h-4 w-4" strokeWidth={2.1} />
                    Go home
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Chat header with tab */}
              <header className="flex items-center gap-3 border-b border-tc-border bg-tc-bg-3/60 px-2 py-2.5 backdrop-blur sm:px-6">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-tc-accent/15 text-tc-accent">
                  <Sparkles className="h-4 w-4" strokeWidth={1.9} />
                </span>
                <div className="min-w-0 flex-1">
                  <h1 className="truncate text-[14px] leading-tight text-tc-text">
                    AI Assistant
                  </h1>
                  <p className="truncate text-[11px] text-tc-muted-2">
                    {meta ? meta.title : "Chatting with the transcript"}
                  </p>
                </div>
                <div className="flex items-center gap-1 rounded-lg border border-tc-border bg-tc-surface/50 p-0.5">
                  <span className="rounded-md bg-tc-surface-2 px-3 py-1 text-[12px] text-tc-text">
                    Chat
                  </span>
                </div>
              </header>

              <ChatMessageList messages={messages} isLoading={isLoading} />

              <ChatComposer
                register={register}
                errors={errors}
                onSubmit={handleSubmit(onSubmit)}
                isLoading={isLoading}
                isDisabled={!youtubeId}
                apiError={apiError}
              />
            </>
          )}
        </section>
      </div>
    </div>
  );
}