# TubeChat Architecture & Auth Specification

## 1. Overview
TubeChat is a RAG-powered chatbot allowing users to index YouTube video transcripts and chat contextually with AI. It supports both **Guest Mode** (frictionless indexing and chat without account creation) and **Authenticated Mode** (persisted personal chat history per user account across sessions/devices).

---

## 2. Authentication Architecture

### 2.1 Token Strategy
- **Mechanism**: JSON Web Tokens (JWT) signed via HMAC-SHA256 (`HS256`).
- **Storage & Transport**: Issued as an `httpOnly`, `Secure`, `SameSite=Lax` cookie named `access_token` by the backend on registration or login.
- **Security**: The raw JWT is never exposed in API response bodies or stored in client-side storage (`localStorage`/`sessionStorage`), preventing XSS token exfiltration.
- **Expiration**: 7 days.
- **Client Handling**: Frontend Axios instance (`api.js`) uses `withCredentials: true` to include cookies automatically with every request.

### 2.2 Endpoints (`/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/auth/register` | Hashes password with bcrypt, creates `User`, sets JWT cookie | No |
| `POST` | `/auth/login` | Validates credentials, sets JWT cookie | No |
| `POST` | `/auth/logout` | Clears `access_token` cookie | No |
| `GET` | `/auth/me` | Validates JWT cookie and returns user profile | Yes (`get_current_user`) |

---

## 3. Guest Mode Architecture

### 3.1 Principles
- Unauthenticated users have full access to index videos and send chat messages.
- Guest chat sessions have `user_id = NULL` in Neon DB (`chat_sessions.user_id`).
- When an anonymous user registers or logs in, prior guest chats are **not** retroactively assigned or migrated to the account (intentional isolation).

### 3.2 Protected vs. Open Routes

| Route | Method | Auth Dependency | Behavior |
|---|---|---|---|
| `/auth/me` | `GET` | `get_current_user` | Strict 401 if unauthenticated |
| `/chat/messages` | `POST` | `get_optional_user` | Creates session with `user.id` if logged in, or `None` if guest |
| `/chat/chat-sessions/recent` | `GET` | `get_optional_user` | Returns user's saved chats if logged in, empty list `[]` if guest |
| `/chat/chat-sessions/{session_id}` | `GET` | Open | Returns session & messages by UUID |
| `/video/index` | `POST` | Open | Indexes video transcript into Chroma DB & Neon |
| `/video/{youtube_id}/chat-sessions` | `GET` | Open | Lists public/session chats for video |

---

## 4. Database Schema (Neon PostgreSQL)

### `users` Table
- `id`: `UUID` (PK)
- `email`: `VARCHAR(100)` (UNIQUE, NOT NULL)
- `hashed_password`: `VARCHAR(255)` (NOT NULL)
- `created_at` / `updated_at`: `TIMESTAMPTZ`

### `chat_sessions` Table
- `id`: `UUID` (PK)
- `user_id`: `UUID` (FK -> `users.id`, `ON DELETE SET NULL`, **NULLABLE**)
- `video_id`: `UUID` (FK -> `videos.id`, `ON DELETE CASCADE`, NOT NULL)
- `title`: `VARCHAR(200)`
- `created_at` / `updated_at`: `TIMESTAMPTZ`

---

## 5. Vector Store Initialization
Vector store initialization (`initialize_vector_store()`) is triggered strictly during FastAPI lifespan startup to ensure single-instance initialization.
