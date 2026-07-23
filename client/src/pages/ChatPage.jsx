import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";

import { ChatComposer } from "../components/ChatComposer";
import { ChatMessageList } from "../components/ChatMessageList";
import { ChatSidebar } from "../components/ChatSidebar";

import {
  chat,
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
  }, [youtubeId, messages.length]); // Refresh sidebar when message count changes

  async function onSubmit({ question }) {
    if (!youtubeId) return;

    setApiError("");
    setIsLoading(true);
    reset(); // Clear input immediately for better immediate UX response

    const userMessage = {
      role: "user",
      content: question,
    };

    setMessages((current) => [...current, userMessage]);

    try {
      const data = await chat({
        youtubeId: youtubeId,
        sessionId: sessionId,
        question,
      });

      // New conversation redirection
      if (!sessionId) {
        navigate(`/chat?session_id=${data.session_id}`, {
          replace: true,
        });
        return;
      }

      // Existing conversation update
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: data.answer,
        },
      ]);
    } catch (error) {
      setApiError(formatError(error));
      // Remove the optimistically added user message on failure so state reflects database truth
      setMessages((current) => current.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
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