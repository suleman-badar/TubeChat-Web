import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";

import { ChatComposer } from "../components/ChatComposer";
import { ChatMessageList } from "../components/ChatMessageList";
import { ChatSidebar } from "../components/ChatSidebar";
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


  const { user } = useAuth(); // Access user from AuthContext

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
  }, [youtubeId, user]); // Refresh sidebar when user logged in/out or when video changes



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
      <div className="chat-fallback-container">
        <div className="fallback-card">
          <h2>No Video Selected</h2>
          <p>Please index a new video or choose a recent conversation from the home page to start chatting.</p>
          <div className="fallback-actions">
            <button
              type="button"
              className="primary-button"
              onClick={() => navigate("/video/index")}
            >
              Index Video
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => navigate("/")}
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="page-card chat-layout chat-shell">
      <ChatSidebar
        youtubeId={youtubeId}
        sessions={sessions}
        currentSessionId={sessionId}
        onSessionClick={handleSessionClick}
        onNewChat={handleNewChat}
      />
      <section className="panel chat-panel">
        <ChatMessageList
          messages={messages}
          isLoading={isLoading}
        />
        <ChatComposer
          register={register}
          errors={errors}
          onSubmit={handleSubmit(onSubmit)}
          isLoading={isLoading}
          isDisabled={!youtubeId}
          apiError={apiError}
        />
      </section>
    </section>
  );
}