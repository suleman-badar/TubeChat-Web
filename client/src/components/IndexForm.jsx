export function IndexForm({ register, errors, onSubmit, isLoading, apiError, result }) {
  return (
    <form className="flex flex-col gap-4 rounded-3xl border border-tc-border bg-tc-surface/80 p-6 shadow-[0_24px_80px_-36px_rgba(0,0,0,0.8)] backdrop-blur" onSubmit={onSubmit}>
      <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-tc-muted-2" htmlFor="videoUrl">
        YouTube URL
      </label>
      <input
        id="videoUrl"
        className="w-full rounded-2xl border border-tc-border bg-tc-surface-2 px-4 py-3 text-tc-text outline-none transition focus:border-tc-accent/60 focus-visible:ring-2 focus-visible:ring-tc-accent/40 placeholder:text-tc-muted-2"
        placeholder="https://www.youtube.com/watch?v=..."
        autoComplete="off"
        {...register('videoUrl', {
          required: 'YouTube URL is required.',
        })}
      />

      {errors.videoUrl ? <p className="rounded-xl border border-tc-error/30 bg-tc-error/10 px-3.5 py-2.5 text-sm text-tc-error">{errors.videoUrl.message}</p> : null}

      <button type="submit" className="inline-flex items-center justify-center rounded-2xl bg-tc-accent px-4 py-3 font-semibold text-[#1a0f05] shadow-[0_16px_34px_-16px_rgba(239,138,59,0.7)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-tc-surface-2 disabled:text-tc-muted-2" disabled={isLoading}>
        {isLoading ? 'Indexing…' : 'Index video'}
      </button>

      {apiError ? <p className="rounded-xl border border-tc-error/30 bg-tc-error/10 px-3.5 py-2.5 text-sm text-tc-error">{apiError}</p> : null}

      {result ? (
        <div className="rounded-xl border border-tc-accent-3/30 bg-tc-accent-3/10 px-3.5 py-3 text-sm text-tc-text">
          <strong>{result.message}</strong>
          {result.youtubeId ? <span>Video ID: {result.youtubeId}</span> : null}
        </div>
      ) : null}
    </form>
  )
}