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

  //
  // Disable page scrolling
  //
  // useEffect(() => {

  //   const previous = document.body.style.overflow;

  //   document.body.style.overflow = "hidden";

  //   return () => {
  //     document.body.style.overflow = previous;
  //   };

  // }, []);

  //
  // Load one chat session
  //



  async function loadConversation(sessionId) {
    try {
      const data =
        await getChatSession(sessionId);
      setMessages(data.messages);
      console.log("YOUTUBE ID IN CHAT PAGE", data.session.youtube_id);
      setYoutubeId(data.session.youtube_id);
    }
    catch (error) {
      setApiError(
        formatError(error)
      );
    }
  }

  useEffect(() => {
    if (!sessionId)
      return;

    loadConversation(sessionId);

  }, [sessionId]);

  //
  // Load sidebar
  //
  useEffect(() => {
    if (!youtubeId)
      return;

    async function loadSessions() {
      try {
        const data = await getVideoChatSessions(youtubeId);
        setSessions(data);
      }
      catch (error) {
        setApiError(
          formatError(error)
        );
      }
    }
    loadSessions();
  }, [youtubeId]);

  async function onSubmit({
    question,
  }) {

    if (!youtubeId)
      return;

    setApiError("");
    setIsLoading(true);

    const userMessage = {
      role: "user",
      content: question,
    };

    setMessages((current) => [
      ...current,
      userMessage,
    ]);

    try {
      const data = await chat({
        youtubeId: youtubeId,
        sessionId: sessionId,
        question,
      })

      // New conversation
      if (!sessionId) {
        navigate(`/chat?session_id=${data.session_id}`, {
          replace: true,
        })

        return
      }

      // Existing conversation
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: data.answer,
        },
      ])
    }
    catch (error) {
      setApiError(
        formatError(error)
      );
    }
    finally {
      setIsLoading(false);
    }
  }

  function handleSessionClick(id) {
    navigate(
      `/chat?session_id=${id}`
    );

  }

  function handleNewChat() {
    if (!youtubeId)
      return;
    setMessages([]);
    navigate(
      `/chat?youtube_id=${youtubeId}`
    );
  }

  return (
    <section
      className="page-card chat-layout chat-shell"
    >
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