export function AppShell({ children }) {
  return (
    <div className="app-container">
      <main className="app-main-content">
        {children}
      </main>
    </div>
  );
}