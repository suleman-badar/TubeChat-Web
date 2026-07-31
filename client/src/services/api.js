import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});


// --------------------
// Video APIs
// --------------------


export async function indexVideo(videoUrl) {
  const { data } = await api.post("/video/index", {
    video_url: videoUrl,
  });

  return data;
}

//
// --------------------
// Chat APIs, using fetch for this one because we need to stream the response and it is easier to do with fetch than axios
// --------------------
//

export async function chatStream({
  youtubeId = null,
  sessionId = null,
  question,
  onToken,    // (tokenText: string) => void
  onSession,  // (sessionId: string) => void
  onDone,     // () => void
  onError,    // (message: string) => void
  signal,     // optional AbortSignal, so callers can cancel a stream
}) {
  const payload = { question };
  if (youtubeId) payload.youtube_id = youtubeId;
  if (sessionId) payload.session_id = sessionId;

  let response;
  try {
    response = await fetch(`${API_BASE_URL}/chat/messages/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // equivalent of axios's withCredentials
      body: JSON.stringify(payload),
      signal,
    });
  } catch (err) {
    onError?.(err.message || "Network error while starting stream");
    return;
  }

  if (!response.ok) {
    let errorMsg = `Request failed with status ${response.status}`;
    try {
      const error = await response.json();
      const detail = error?.detail || error?.details;
      if (detail) {
        errorMsg = typeof detail === "string" ? detail : (detail.message || errorMsg);
      }
    } catch (e) {
      // Response was not JSON or parsing failed
    }
    onError?.(errorMsg);
    return;
  }

  if (!response.body) {
    onError?.("Response body is null");
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop(); // keep incomplete trailing line for next chunk

      for (const line of lines) {
        if (!line.trim()) continue;

        let msg;
        try {
          msg = JSON.parse(line);
        } catch {
          // Shouldn't happen if backend sends one full JSON object per line,
          // but skip defensively rather than crash the stream.
          continue;
        }

        if (msg.type === "answer") onToken?.(msg.content);
        else if (msg.type === "session") onSession?.(msg.session_id);
        else if (msg.type === "error") onError?.(msg.content);
        else if (msg.type === "done") onDone?.();
      }
    }
  } catch (err) {
    if (err.name === "AbortError") {
      // Caller cancelled the stream intentionally — not an error to surface
      return;
    }
    onError?.(err.message || "Stream reading failed");
  }
}


//
// --------------------
// Chat Session APIs
// --------------------
//

export async function getChatSession(sessionId) {
  const { data } = await api.get(
    `/chat/chat-sessions/${sessionId}`
  );

  return data;
}

export async function getVideoChatSessions(youtubeId) {
  const { data } = await api.get(
    `/video/${youtubeId}/chat-sessions`
  );

  return data;
}

export async function getRecentChatSessions() {
  const { data } = await api.get(
    "/chat/recent-sessions"
  );

  return data;
}

export async function loginUser(email, password) {
  const { data } = await api.post('/auth/login', { email, password })
  return data
}

export async function registerUser(email, password, confirmPassword) {
  const { data } = await api.post('/auth/register', { email, password, confirmPassword });
  return data;
}

export async function logoutUser() {
  const { data } = await api.post('/auth/logout');
  return data;
}

export async function getCurrentUser() {
  const { data } = await api.get('/auth/me');
  // console.log("Current user data: API", data);
  return data;
}


export async function getBillingConfig() {
  const data = await api.get('/billing/config');
  console.log("Billing config data: API", data);
  return data;
}