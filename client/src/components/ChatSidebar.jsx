export function ChatSidebar({ videoId, navigate }) {
  return (
    <aside className="panel chat-sidebar">
      <p className="eyebrow">Step 2</p>
      <h2>Chat with the indexed video</h2>

      <div className="info-block">
        <span className="info-label">Current video</span>
        <strong>{videoId || 'No video selected'}</strong>
      </div>

      <button type="button" className="secondary-button" onClick={() => navigate('/')}>Index another video</button>
    </aside>
  )
}