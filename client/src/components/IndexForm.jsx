export function IndexForm({ register, errors, onSubmit, isLoading, apiError, result }) {
  return (
    <form className="panel form-panel" onSubmit={onSubmit}>
      <label className="field-label" htmlFor="videoUrl">
        YouTube URL
      </label>
      <input
        id="videoUrl"
        className="text-input"
        placeholder="https://www.youtube.com/watch?v=..."
        autoComplete="off"
        {...register('videoUrl', {
          required: 'YouTube URL is required.',
        })}
      />

      {errors.videoUrl ? <p className="status-message error">{errors.videoUrl.message}</p> : null}

      <button type="submit" className="primary-button" disabled={isLoading}>
        {isLoading ? 'Indexing…' : 'Index video'}
      </button>

      {apiError ? <p className="status-message error">{apiError}</p> : null}

      {result ? (
        <div className="status-message success">
          <strong>{result.message}</strong>
          {result.videoId ? <span>Video ID: {result.videoId}</span> : null}
        </div>
      ) : null}
    </form>
  )
}