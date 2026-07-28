export function AppShell({ children }) {
  return (
    <div className="h-dvh w-full overflow-hidden bg-tc-bg text-tc-text flex flex-col">
      <main className="flex-1 min-h-0 overflow-hidden flex flex-col">
        {children}
      </main>
    </div>
  );
}