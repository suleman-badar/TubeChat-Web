export function AppHeader({ route, navigate }) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-tc-border bg-tc-bg-3/90 px-4 py-3 backdrop-blur sm:px-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-tc-accent-2">YouTube Chatbot</p>
        <h4 className="mt-1 text-lg font-semibold tracking-tight text-tc-text">Index a video, then ask questions with context.</h4>
      </div>

      {/* <nav className="flex items-center gap-3" aria-label="Primary">
        <button
          type="button"
          className={route === 'index' ? 'rounded-full border border-tc-border-strong bg-tc-accent/10 px-4 py-2 text-sm text-tc-text' : 'rounded-full border border-tc-border bg-tc-surface/50 px-4 py-2 text-sm text-tc-muted transition hover:text-tc-text'}
          onClick={() => navigate('/')}
        >
          Index video
        </button> */}
        {/* <button
          type="button"
          className={route === 'chat' ? 'rounded-full border border-tc-border-strong bg-tc-accent/10 px-4 py-2 text-sm text-tc-text' : 'rounded-full border border-tc-border bg-tc-surface/50 px-4 py-2 text-sm text-tc-muted transition hover:text-tc-text'}
          onClick={() => navigate('/chat')}
        >
          Chat
        </button> */}
      {/* </nav> */}
    </header>
  )
}