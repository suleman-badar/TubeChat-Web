import { ArrowUp, AlertCircle, Loader2 } from "lucide-react";

export function ChatComposer({
  register,
  errors,
  onSubmit,
  isLoading,
  isDisabled,
  apiError,
}) {
  const { ref, ...rest } = register("question", {
    required: "Question is required.",
  });

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  }

  const message = errors.question?.message || apiError;

  return (
    <div className="px-4 pb-4 pt-2 sm:px-6 sm:pb-6">
      <div className="mx-auto w-full max-w-3xl">
        {message ? (
          <div className="tc-fade-up mb-2 flex items-center gap-2 rounded-xl border border-tc-error/30 bg-tc-error/10 px-3.5 py-2.5 text-tc-error">
            <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={2} />
            <span className="text-sm">{message}</span>
          </div>
        ) : null}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <label htmlFor="question" className="sr-only">
            Your question
          </label>

          <div className="group relative flex items-end gap-2 rounded-2xl border border-tc-border bg-tc-surface/90 p-2 shadow-[0_18px_45px_-20px_rgba(0,0,0,0.85)] backdrop-blur transition-colors focus-within:border-tc-accent/60">
            <textarea
              id="question"
              rows={1}
              placeholder="Ask anything about this video…"
              disabled={isLoading || isDisabled}
              onKeyDown={handleKeyDown}
              ref={ref}
              {...rest}
              className="tc-scroll max-h-40 min-h-[44px] flex-1 resize-none bg-transparent px-3 py-2.5 text-[14px] leading-relaxed text-tc-text placeholder:text-tc-muted-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            />

            <button
              type="submit"
              disabled={isLoading || isDisabled}
              aria-label="Send question"
              className="mb-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-tc-accent text-[#1a0f05] shadow-[0_8px_20px_-6px_rgba(239,138,59,0.6)] transition-all hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-tc-accent focus-visible:ring-offset-2 focus-visible:ring-offset-tc-bg disabled:cursor-not-allowed disabled:bg-tc-surface-2 disabled:text-tc-muted-2 disabled:shadow-none"
            >
              {isLoading ? (
                <Loader2
                  className="h-5 w-5 animate-spin"
                  strokeWidth={2.4}
                />
              ) : (
                <ArrowUp className="h-5 w-5" strokeWidth={2.6} />
              )}
            </button>
          </div>
        </form>

        <p className="mt-2 text-center text-xs text-tc-muted-2">
          Press{" "}
          <kbd className="rounded border border-tc-border bg-tc-surface-2 px-1.5 py-0.5 text-[11px] text-tc-muted">
            Enter
          </kbd>{" "}
          to send,{" "}
          <kbd className="rounded border border-tc-border bg-tc-surface-2 px-1.5 py-0.5 text-[11px] text-tc-muted">
            Shift + Enter
          </kbd>{" "}
          for a new line
        </p>
      </div>
    </div>
  );
}