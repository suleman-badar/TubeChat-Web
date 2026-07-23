import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { IndexPage } from "./pages/IndexPage";
import { ChatPage } from "./pages/ChatPage";

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

      {/* Redirect any unknown route to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}