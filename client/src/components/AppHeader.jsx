export function AppHeader({ route, navigate }) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">YouTube Chatbot</p>
        <h4>Index a video, then ask questions with context.</h4>
      </div>

      <nav className="topbar-actions" aria-label="Primary">
        <button
          type="button"
          className={route === 'index' ? 'nav-link active' : 'nav-link'}
          onClick={() => navigate('/')}
        >
          Index video
        </button>
        <button
          type="button"
          className={route === 'chat' ? 'nav-link active' : 'nav-link'}
          onClick={() => navigate('/chat')}
        >
          Chat
        </button>
      </nav>
    </header>
  )
}