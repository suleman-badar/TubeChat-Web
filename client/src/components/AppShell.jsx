import { useNavigate } from "react-router-dom";

export function AppShell({ children }) {
  const navigate = useNavigate();

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-logo" onClick={() => navigate("/")}>
          <span className="logo-text">TubeChat</span>
        </div>
        <nav className="header-nav">
          <button 
            type="button" 
            className="nav-btn" 
            onClick={() => navigate("/")}
          >
            Home
          </button>
          <button 
            type="button" 
            className="nav-btn primary" 
            onClick={() => navigate("/video/index")}
          >
             Index Video
          </button>
        </nav>
      </header>
      <main className="app-main-content">
        {children}
      </main>
    </div>
  );
}
