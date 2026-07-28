import { useEffect, useRef } from "react";
import { Sparkles, MessageSquareText } from "lucide-react";

const SUGGESTIONS = [
  "Summarise this video in 3 bullet points",
  "What are the key takeaways?",
  "Explain the main concept simply",
];

function TypingDots() {
  return (
    <span
      className="inline-flex items-center gap-1 py-1"
      aria-label="Assistant is typing"
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-tc-muted-2"
          style={{
            animation: `tc-blink 1.2s ${i * 0.18}s infinite ease-in-out`,
          }}
        />
      ))}
    </span>
  );
}

export function ChatMessageList({ messages, isLoading }) {
  const listEndRef = useRef(null);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const lastIndex = messages.length - 1;

  return (
    <div
      className="tc-scroll relative flex-1 overflow-y-auto"
      aria-live="polite"
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6">
        {messages.length === 0 ? (
          <div className="tc-fade-up flex min-h-[52vh] flex-col items-center justify-center text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-tc-border bg-gradient-to-b from-tc-surface-2 to-tc-surface shadow-[0_20px_50px_-24px_rgba(0,0,0,0.9)]">
              <Sparkles
                className="h-7 w-7 text-tc-accent"
                strokeWidth={1.8}
              />
            </div>

            <h3 className="text-xl text-tc-text">
              Start the conversation
            </h3>

            <p className="mt-2 max-w-sm text-sm leading-relaxed text-tc-muted">
              Ask a question about the video transcript and the answer will
              appear here, grounded in what was actually said.
            </p>

            <div className="mt-7 flex w-full max-w-md flex-col gap-2">
              {SUGGESTIONS.map((s) => (
                <div
                  key={s}
                  className="flex items-center gap-3 rounded-xl border border-tc-border bg-tc-surface/60 px-4 py-3 text-left text-sm text-tc-muted"
                >
                  <MessageSquareText
                    className="h-4 w-4 shrink-0 text-tc-accent-2"
                    strokeWidth={1.8}
                  />
                  {s}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {messages.map((message, index) => {
          const isUser = message.role === "user";
          const isStreamingBubble =
            !isUser &&
            isLoading &&
            index === lastIndex &&
            message.content === "";

          return (
            <div
              key={`${message.role}-${index}`}
              className={`flex gap-3 tc-fade-up ${
                isUser ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs ${
                  isUser
                    ? "bg-tc-surface-2 text-tc-muted"
                    : "bg-tc-accent/15 text-tc-accent"
                }`}
              >
                {isUser ? (
                  "You"
                ) : (
                  <Sparkles className="h-4 w-4" strokeWidth={1.8} />
                )}
              </div>

              <div
                className={`flex max-w-[85%] flex-col ${
                  isUser ? "items-end" : "items-start"
                }`}
              >
                <span className="mb-1 px-1 text-xs text-tc-muted-2">
                  {isUser ? "You" : "AI Assistant"}
                </span>

                <div
                  className={`whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed ${
                    isUser
                      ? "rounded-tr-sm bg-tc-accent text-[#1a0f05]"
                      : "rounded-tl-sm border border-tc-border bg-tc-surface text-tc-text"
                  }`}
                >
                  {isStreamingBubble ? (
                    <TypingDots />
                  ) : (
                    <>
                      {message.content}
                      {!isUser && isLoading && index === lastIndex ? (
                        <span className="tc-caret ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 bg-tc-accent" />
                      ) : null}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={listEndRef} />
      </div>
    </div>
  );
}