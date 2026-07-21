export function HomePage({ navigate }) {
  return (
    <main className="home-page">
      <div className="home-card">
        <h1>YouTube RAG Chatbot</h1>
        

        <p className="home-subtitle">
          Index any YouTube video and chat with its content using AI.
        </p>

        <div className="home-actions">
          <button
            className="primary-button"
            onClick={() => navigate("/video/index")}
          >
            📥 Index New Video
          </button>

          <button
            className="secondary-button"
            onClick={() => navigate("/chat")}
          >
            💬 Open Chat
          </button>
        </div>
      </div>
    </main>
  );
}