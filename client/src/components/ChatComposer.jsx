export function ChatComposer({ register, errors, onSubmit, isLoading, isDisabled, apiError }) {
  const { ref, ...rest } = register('question', {
    required: 'Question is required.',
  })

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmit()
    }
  }

  return (
    <form className="chat-form" onSubmit={onSubmit}>
      <label className="field-label" htmlFor="question">
        Your question
      </label>

      <div className="input-wrapper">
        <textarea
          id="question"
          className="text-input text-area"
          placeholder="What is the main topic of this video?"
          rows="2"
          disabled={isLoading || isDisabled}
          onKeyDown={handleKeyDown}
          ref={ref}
          {...rest}
        />

        <button
          type="submit"
          className="send-button"
          disabled={isLoading || isDisabled}
          aria-label="Send question"
        >
          {isLoading ? (
            <span className="send-spinner" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 19V5M12 5L5 12M12 5L19 12"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </div>

      {errors.question ? <p className="status-message error">{errors.question.message}</p> : null}

      {apiError ? <p className="status-message error">{apiError}</p> : null}
    </form>
  )
}