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
// Chat APIs
// --------------------
//

export async function chat({
  youtubeId = null,
  sessionId = null,
  question,
}) {
  const payload = {
    question,
  };

  // New conversation
  if (youtubeId) {
    payload.youtube_id = youtubeId;
  }

  // Existing conversation
  if (sessionId) {
    payload.session_id = sessionId;
  }

  const { data } = await api.post("/chat/messages", payload);

  return data;
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
    "/chat/chat-sessions/recent"
  );

  return data;
}

export async function loginUser(email, password) {
  const {data} = await api.post('/auth/login', { email, password })
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