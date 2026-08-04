<div align="center">

<img src="https://img.shields.io/badge/TubeChat-AI%20Video%20Assistant-6C63FF?style=for-the-badge&logo=youtube&logoColor=white" alt="TubeChat Banner" />

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/suleman-badar/TubeChat-Web)

# TubeChat

### Chat with any YouTube video using AI. Instantly.

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.139-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-PGVector-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Groq](https://img.shields.io/badge/Groq-Llama%203.3-FF6B35?style=flat-square)](https://console.groq.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](./LICENSE)
[![Deploy](https://img.shields.io/badge/Deployed%20on-Render%20+%20Vercel-black?style=flat-square)](https://tube-chat-web.vercel.app)

**[Live Demo →](https://tube-chat-web.vercel.app)**

</div>

---

## What is TubeChat?

TubeChat turns any YouTube video into an interactive AI assistant. Paste a video URL, and instantly ask questions, get summaries, find specific moments, and explore the content through natural conversation — no scrubbing through timelines required.

---

##  Features

- ** Instant Video Indexing** — Paste any YouTube URL and TubeChat extracts & indexes the full transcript in seconds
- ** Context-Aware Chat** — Ask questions and get answers grounded in what the video actually says
- ** Real-Time Streaming** — AI responses stream live, token by token, for a fast and fluid experience
- ** Guest Mode** — Try it immediately without creating an account (20 messages & 2 videos on trial)
- ** Secure Accounts** — Register to save your chat history across sessions and devices
- ** Session History** — Return to any previous conversation with any video you've indexed
- ** Pro Plan** — Unlock higher limits via seamless in-app subscription powered by Paddle
- ** Conversation Memory** — The AI remembers context within a session for natural back-and-forth dialogue

---

##  Demo

> **[🔗 Try it live → tube-chat-web.vercel.app](https://tube-chat-web.vercel.app)**

### Application Workflow

```
1. Paste a YouTube URL on the home page
      ↓
2. TubeChat indexes the video transcript (takes ~10–30s)
      ↓
3. You land in the chat workspace
      ↓
4. Ask anything about the video and get streamed AI answers
      ↓
5. Create an account to save sessions and return anytime
```

---

##  What Problem It Solves

Long-form video content is hard to navigate. A 2-hour podcast, a 45-minute lecture, or a technical tutorial can hide the exact answer you need somewhere in the middle.

**TubeChat solves this by:**

- Letting you ask *"What does the speaker say about X?"* instead of scrubbing for it
- Giving you accurate, transcript-grounded answers (no hallucination)
- Enabling multi-turn conversations that build on each other
- Saving your Q&A history so you can resume where you left off

Whether you're a student revisiting lecture content, a professional skimming conference talks, or a developer exploring technical videos — TubeChat gives you a smarter way in.

---

##  Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Vanilla CSS |
| **Backend** | FastAPI (Python 3.11) |
| **Database** | PostgreSQL + PGVector (Neon) |
| **AI — LLM** | Groq (Llama 3.3 70B) |
| **AI — Embeddings** | Google Generative AI (embedding-001) |
| **Authentication** | JWT (HTTP-Only Cookies) + Bcrypt |
| **Payments** | Paddle |
| **Frontend Hosting** | Vercel |
| **Backend Hosting** | Render |

---

##  Getting Started

### Prerequisites

Make sure you have the following installed:

- **Node.js** `18+`
- **Python** `3.11.x`
- **PostgreSQL** with the [PGVector extension](https://github.com/pgvector/pgvector) enabled
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/suleman-badar/tubechat-web.git
cd tubechat
```

### 2. Backend Setup

```bash
cd server
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
```

### 3. Frontend Setup

```bash
cd client
npm install
```

---

##  Environment Variables

### Backend (`server/.env`)

Create a `.env` file inside the `server/` directory:

```env
# PostgreSQL (must have PGVector extension enabled)
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/tubechat

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-characters

# AI Services
GOOGLE_API_KEY=your-google-ai-studio-key
GROQ_API_KEY=your-groq-cloud-api-key

# Payments (optional — only needed for Pro plan)
PADDLE_WEBHOOK_SECRET=your-paddle-webhook-secret
PADDLE_PRO_PRICE_ID=your-paddle-price-id
```

| Variable | Required | Where to Get It |
|---|---|---|
| `DATABASE_URL` | ✅ Yes | Your PostgreSQL instance |
| `JWT_SECRET` | ✅ Yes | Any 32+ char random string |
| `GOOGLE_API_KEY` | ✅ Yes | [aistudio.google.com](https://aistudio.google.com) — Free |
| `GROQ_API_KEY` | ✅ Yes | [console.groq.com](https://console.groq.com) — Free |
| `PADDLE_WEBHOOK_SECRET` | ⚡ Optional | [Paddle Dashboard](https://vendors.paddle.com) |
| `PADDLE_PRO_PRICE_ID` | ⚡ Optional | [Paddle Dashboard](https://vendors.paddle.com) |

### Frontend (`client/.env`)

Create a `.env` file inside the `client/` directory:

```env
VITE_API_BASE_URL=http://localhost:8000
```

> **Note:** For production Vercel deployments, set `VITE_API_BASE_URL` to your Render backend URL in the Vercel Environment Variables dashboard **before** deploying, since Vite bakes this value into the static build.

---

##  Running Locally

### Start the Backend

```bash
cd server
source .venv/bin/activate  # or .venv\Scripts\activate on Windows

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`.  
Interactive API docs at `http://localhost:8000/docs`.

### Start the Frontend

```bash
cd client
npm run dev
```

The app will be available at `http://localhost:5173`.

---

##  Usage

### 1. Index a Video

Navigate to the home page and paste any YouTube URL into the input field.

```
https://www.youtube.com/watch?v=R8_veQiYBjI
```

Click **"Analyze Video"** and wait for indexing to complete (~10–30 seconds depending on video length).

### 2. Start Chatting

You'll be taken directly to the chat workspace. Ask anything:

> *"Summarize the main points of this video."*  
> *"What does the speaker say about machine learning?"*  
> *"Give me the key takeaways from the first half."*

### 3. Save Your History (Optional)

Click **Sign Up** to create a free account. Your chat sessions are saved and accessible from the sidebar anytime.

### 4. Upgrade to Pro (Optional)

Hit your plan limits? Click **Upgrade** in the navigation rail to unlock higher message and video quotas.

---

##  Screenshots

| Home Page | Chat Workspace |
|---|---|
| *Coming soon* | *Coming soon* |

| Session History Sidebar | Pricing Page |
|---|---|
| *Coming soon* | *Coming soon* |

---

##  API Overview

The backend exposes a RESTful API. Base URL: `http://localhost:8000`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/auth/register` | Create a new account | No |
| `POST` | `/auth/login` | Log in | No |
| `POST` | `/auth/logout` | Log out | No |
| `GET` | `/auth/me` | Get current user | Yes |
| `POST` | `/video/index` | Index a YouTube video | Optional |
| `GET` | `/video/{id}/chat-sessions` | Get sessions for a video | Optional |
| `POST` | `/chat/messages/stream` | Stream an AI response | Optional |
| `GET` | `/chat/recent-sessions` | Get recent chat sessions | Optional |
| `GET` | `/billing/config` | Get current plan details | Yes |

> Full interactive API docs available at `/docs` when the backend is running.

---

##  Deployment

### Frontend (Vercel)

1. Connect your GitHub repository to [Vercel](https://vercel.com).
2. Set the **Root Directory** to `client`.
3. Add Environment Variable:
   - `VITE_API_BASE_URL` → your Render backend URL (e.g. `https://your-app.onrender.com`)
4. Deploy. Vercel auto-deploys on every push to `main`.

### Backend (Render)

1. Create a new **Web Service** on [Render](https://render.com).
2. Set the **Root Directory** to `server`.
3. Configure:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Python Version**: `3.11.9`
4. Add all backend environment variables in the **Environment** tab.
5. Deploy.

> **Free Tier Note:** Render's free tier provides 512MB RAM. TubeChat is optimized for this limit — it uses API-based AI models instead of locally-loaded models to stay well within memory constraints.

---

##  Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature-name`
3. **Commit** your changes: `git commit -m 'feat: add your feature'`
4. **Push** to the branch: `git push origin feature/your-feature-name`
5. **Open a Pull Request**

### Guidelines

- Follow the existing code style
- Keep PRs focused on a single feature or fix
- Write clear commit messages using [Conventional Commits](https://www.conventionalcommits.org)
- Test your changes locally before submitting

---

## 🗺 Roadmap

| Status | Feature |
|---|---|
| ✅ | YouTube video ingestion & RAG chat |
| ✅ | Real-time response streaming |
| ✅ | Guest mode with IP rate limiting |
| ✅ | User accounts & session history |
| ✅ | Paddle subscription integration |
| 🔄 | PDF document support |
| 🔄 | Website URL support |
| 🔄 | Multi-language transcript support |
| 🔄 | Video timestamp citation in answers |
| 🔄 | Shared public chat sessions |
| 💡 | Playlist batch indexing |
| 💡 | Chrome extension |
| 💡 | Mobile app |

---

##  License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

---

##  Acknowledgements

- [LangChain](https://www.langchain.com) — RAG orchestration framework
- [Groq](https://groq.com) — Ultra-fast LLM inference
- [Google AI Studio](https://aistudio.google.com) — Free embedding API
- [youtube-transcript-api](https://github.com/jdepoix/youtube-transcript-api) — Transcript extraction
- [PGVector](https://github.com/pgvector/pgvector) — Vector similarity search in PostgreSQL
- [Neon](https://neon.tech) — Serverless PostgreSQL
- [Paddle](https://paddle.com) — Payments infrastructure
- [Vite](https://vitejs.dev) — Blazing-fast frontend build tool

---

<div align="center">

**Built with ❤️ by [Suleman](https://github.com/suleman-badar)**

⭐ **Star this repo if you find it useful!** ⭐

</div>
