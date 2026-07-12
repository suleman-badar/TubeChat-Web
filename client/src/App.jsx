import { useRoute } from './hooks/useRoute'
import { AppHeader } from './components/AppHeader'
import { IndexPage } from './pages/IndexPage'
import { ChatPage } from './pages/ChatPage'

function App() {
  const { route, navigate } = useRoute()

  return (
    <div className="app-shell">
      <AppHeader route={route} navigate={navigate} />

      <main className="content-grid">
        {route === 'chat' ? (
          <ChatPage navigate={navigate} />
        ) : (
          <IndexPage navigate={navigate} />
        )}
      </main>
    </div>
  )
}

export default App
