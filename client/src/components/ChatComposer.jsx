export function ChatComposer({ register, errors, onSubmit, isLoading, isDisabled, apiError }) {
  return (
    <form className="chat-form" onSubmit={onSubmit}>
      <label className="field-label" htmlFor="question">
        Your question
      </label>
      <textarea
        id="question"
        className="text-input text-area"
        placeholder="What is the main topic of this video?"
        rows="4"
        {...register('question', {
          required: 'Question is required.',
        })}
      />

      {errors.question ? <p className="status-message error">{errors.question.message}</p> : null}

      {apiError ? <p className="status-message error">{apiError}</p> : null}

      <button type="submit" className="primary-button" disabled={isLoading || isDisabled}>
        {isLoading ? 'Thinking…' : 'Send question'}
      </button>
    </form>
  )
}