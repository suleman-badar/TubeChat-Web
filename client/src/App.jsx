import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { IndexPage } from "./pages/IndexPage";
import { ChatPage } from "./pages/ChatPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { AppShell } from "./components/AppShell";
import { AuthProvider } from "./contexts/AppContext";

function AppRoutes() {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route path="/" element={<HomePage navigate={navigate} />} />

      <Route
        path="/video/index"
        element={<IndexPage navigate={navigate} />}
      />

      <Route
        path="/chat"
        element={<ChatPage navigate={navigate} />}
      />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Redirect any unknown route to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell>
          <AppRoutes />
        </AppShell>
      </AuthProvider>
    </BrowserRouter>
  );
}