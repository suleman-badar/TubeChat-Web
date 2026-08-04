# TubeChat - Master Internal Technical Documentation

> **Document Version**: 2.0.0  
> **Author**: Staff Software Engineer / Lead Architect  
> **Target Audience**: Core Developers, Maintainers & Engineering Leadership  
> **Last Updated**: August 2026  
> **Status**: Living Single Source of Truth

---

## 1. Project Overview

### Overall Purpose
**TubeChat** is an enterprise-grade, full-stack Retrieval-Augmented Generation (RAG) platform. It allows users to convert any public YouTube video into an interactive, context-aware AI conversation partner. By extracting video transcripts, chunking them, generating vector embeddings, and indexing them in a PostgreSQL vector store (`PGVector`), TubeChat allows users to query video content directly, obtain grounded answers with zero hallucination, and navigate long-form video knowledge efficiently.

### Problem Being Solved
1. **Unstructured Video Information**: Video content is linear and time-consuming to consume (~30–60 minutes for a podcast or lecture). Finding specific answers or sections requires manual scrubbing.
2. **LLM Context Limits & Hallucinations**: Feeding an entire 50,000-word transcript into an LLM context window is expensive, slow, and often leads to middle-loss or hallucinated answers.
3. **Credit Exhaustion & Multi-Tenant Security**: Unauthenticated public APIs are vulnerable to credit-burning attacks where malicious bots trigger thousands of embedding calls.
4. **Frictionless Onboarding vs. Data Isolation**: Users demand immediate trial functionality (Guest Mode) without registering, yet registered accounts require persistent, isolated conversation histories.

### Major Features
- **Guest Trial Mode (Anonymous Browsing)**: Immediate video indexing and chatting without registration. Guest sessions feature strict memory isolation (no chat history exposed across sessions) and IP-based rate limiting (20 messages & 2 videos per 24 hours per IP).
- **Authenticated Accounts**: Secure registration and login using bcrypt password hashing and 7-day `httpOnly`, `SameSite=Lax` JWT authentication cookies.
- **Batched & Resilient RAG Pipeline**: Ingestion via `youtube_transcript_api`, recursive character splitting (3,000 chars, 300 overlap), batched vector indexing with exponential backoff retries, MMR (Maximal Marginal Relevance) retrieval, and LLM synthesis.
- **Low-Latency Response Streaming**: Server-Sent Newline-Delimited JSON (NDJSON) streaming using FastAPI `StreamingResponse` and custom client-side `ReadableStream` reader.
- **SaaS Monetization & Paddle Webhooks**: Plan tiering (Free vs. Pro) enforced via database subscription models, backed by Paddle Payment Gateway featuring HMAC-SHA256 webhook signature verification.
- **Modular AI Architecture**: Plug-and-play LLM engine support (Groq `llama-3.3-70b-versatile`, Google Gemini `gemini-2.0-flash`, OpenAI, or AWS Bedrock) paired with Google Generative AI Embeddings (`models/embedding-001`).

### Technologies Used

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Frontend Framework** | React | 18.x | Declarative Single Page Application (SPA) UI |
| **Build Tooling** | Vite | 5.x | Fast HMR development & optimized production bundles |
| **Styling & Design System** | Vanilla CSS | 3.x | Custom CSS variables, glassmorphism design tokens |
| **Icons & UI Extras** | Lucide React | Latest | Modern icon set |
| **Frontend Forms** | React Hook Form | 7.x | Controlled form state & client validation |
| **HTTP Client** | Axios & Fetch API | Latest | Axios for REST; native `fetch` for NDJSON streams |
| **Backend Framework** | FastAPI | 0.139.0 | High-performance async ASGI web application framework |
| **Python Runtime** | Python | 3.11.9 | Locked via `.python-version` to prevent 3.14 build errors |
| **Async Database ORM** | SQLAlchemy | 2.0.51 | Async database access & model mapping |
| **Database Driver** | Asyncpg & Psycopg | 0.31.0 / 3.3.4 | Async driver for app runtime; Psycopg for PGVector |
| **Database Host** | PostgreSQL + PGVector | 0.3.6 | Relational tables + vector similarity indexing |
| **RAG Orchestration** | LangChain | 1.3.13 | Vector store abstraction, prompts, and runnables |
| **Vector Store Integration** | `langchain-postgres` | 0.0.17 | Native PostgreSQL PGVector LangChain integration |
| **AI LLM Engine** | Groq (`langchain-groq`) | 0.2.x | Low-latency Llama 3.3 70B inference |
| **AI Embeddings Engine** | Google GenAI | 4.2.7 | 768-dimensional text embeddings (`embedding-001`) |
| **Authentication Security** | PyJWT & Bcrypt | 2.13.0 / 5.0.0 | JWT generation/verification & password hashing |
| **Payment Gateway** | Paddle Webhook API | V2 | Subscription creation, updates, and cancellations |

### High-Level Architecture Diagram

```mermaid
graph TD
    UserClient["React 18 SPA (Vite)"] <-->|REST API + HTTP-Only Cookie| FastApiApp["FastAPI ASGI Server (Python 3.11.9)"]
    
    subgraph Security & Dependency Middleware
        FastApiApp --> AuthDep["Auth Middleware (JWT in Cookie)"]
        FastApiApp --> RateLimit["IP Rate Limiter (Sliding Window)"]
        FastApiApp --> Lifespan["Lifespan App State Manager"]
    end
    
    subgraph Business Logic Layer
        FastApiApp --> AuthRouter["/auth Router"]
        FastApiApp --> VideoRouter["/video Router"]
        FastApiApp --> ChatRouter["/chat Router"]
        FastApiApp --> PaddleRouter["/paddle Router"]
        
        VideoRouter --> VideoService["Video Service"]
        ChatRouter --> ChatService["Chat Service"]
        PaddleRouter --> PaddleService["Paddle Webhook Service"]
    end
    
    subgraph Data & AI Infrastructure
        VideoService --> YoutubeAPI["YouTube Transcript API"]
        VideoService --> PGVectorStore["PGVector Store (langchain_pg)"]
        ChatService --> PGVectorStore
        ChatService --> RAGPipeline["LangChain RAG Chain"]
        
        PGVectorStore <-->|pgvector extension| PostgresDB[("Neon PostgreSQL Database")]
        RAGPipeline <-->|Embedding API| GoogleEmbeddings["Google AI Studio (embedding-001)"]
        RAGPipeline <-->|Completion API| GroqCloud["Groq Cloud (llama-3.3-70b-versatile)"]
        PaddleService <-->|HMAC-SHA256 Signed Webhooks| PaddleGateway["Paddle Payment Infrastructure"]
    end
```

---

## 2. Folder Structure

```
YoutubeChatbot/
├── .python-version               # Python runtime pin (3.11.9) for Render deployments
├── ARC.md                        # Original Architecture & Authentication specification
├── README.md                     # High-level developer README
├── DOCUMENTATION.md              # Master technical internal documentation (this file)
├── client/                       # React 18 Frontend Single Page Application
│   ├── index.html                # Main HTML entry point with Google Fonts preloads
│   ├── package.json              # Client dependencies, scripts, and dev server config
│   ├── vite.config.js            # Vite build configuration & local dev API proxies
│   └── src/
│       ├── main.jsx              # React DOM mounting point
│       ├── App.jsx               # Main React router & authenticated route guards
│       ├── App.css               # Design system tokens, Glassmorphism CSS, animations
│       ├── components/           # Reusable functional UI components
│       │   ├── ChatComposer.jsx  # Textarea input bar with submit & enter key handlers
│       │   ├── ChatMessageList.jsx # Scrollable message bubble list with auto-scroll
│       │   ├── ContextPanel.jsx  # Left sidebar listing chat history & guest warnings
│       │   └── NavRail.jsx       # Vertical navigation rail with plan status badge
│       ├── contexts/             # Global React Context providers
│       │   ├── AppContext.jsx    # UI state management (sidebar, selected video ID)
│       │   └── AuthContext.jsx   # Authentication context (user state, login, register, logout)
│       ├── pages/                # Top-level page views
│       │   ├── ChatPage.jsx      # Primary workspace for chatting with indexed video
│       │   ├── HomePage.jsx      # Hero landing page for YouTube URL submission
│       │   ├── IndexPage.jsx     # Video ingestion progress & loading view
│       │   └── PricingPage.jsx   # Tier comparison table & Paddle checkout overlay
│       └── services/
│           └── api.js            # Axios client, credentials config, & NDJSON fetch reader
└── server/                       # FastAPI Backend Application
    ├── .python-version           # Backend-specific runtime pin (3.11.9)
    ├── requirements.txt          # Pinned Python dependencies
    └── app/
        ├── main.py               # Application entry, CORS, router mounts, lifespan manager
        ├── database/             # Relational ORM models & session creation
        │   ├── connection.py     # SQLAlchemy async engine & sessionmaker factory
        │   ├── crud/             # Database CRUD helper functions
        │   └── models/           # SQLAlchemy model definitions
        ├── dependencies/         # FastAPI Dependency Injection handlers
        │   ├── auth_dependency.py # get_current_user & get_optional_user helpers
        │   ├── db_dependency.py   # get_db AsyncSession yield generator
        │   └── rag_dependency.py  # get_llm & get_prompt app.state accessors
        ├── routers/              # HTTP Controllers & Route handlers
        │   ├── auth_route.py     # Login, register, logout, me routes
        │   ├── billing_route.py  # Billing config route
        │   ├── chat_route.py     # Message streaming & conversation history routes
        │   ├── paddle_route.py   # Webhook ingestion endpoint
        │   └── video_route.py    # Video indexing & chat session discovery routes
        ├── schemas/              # Pydantic v2 Data Validation Schemas
        │   ├── auth_schema.py    # Login/Register request & user response schemas
        │   ├── chat_schema.py    # Chat stream request & session response schemas
        │   └── video_schema.py   # Video index request & session list schemas
        └── services/             # Pure Business Logic Layer
            ├── auth_service.py   # Password hashing, JWT token creation/verification, guest check
            ├── chat_service.py   # Message limits validation & NDJSON streaming generator
            ├── paddle_service.py # HMAC signature validation & webhook event handlers
            ├── rag.py            # LangChain pipeline setup, prompt, embeddings & LLM builders
            ├── rate_limit_service.py # In-memory sliding window IP rate limiting logic
            ├── transcript.py     # YouTube transcript fetching & recursive character splitting
            ├── vector_store.py   # PGVector initialization, batched document indexing, retriever
            ├── video_service.py  # Video indexing pipeline & video limit enforcement
            └── youtube.py        # YouTube URL parsing & 11-char ID extraction utility
```

### Why Each Folder Exists & Their Responsibilities
- `client/src/contexts/`: Solves the problem of prop-drilling. Manages user authentication state (`AuthContext`) and UI state (`AppContext`) globally across page transitions.
- `client/src/services/api.js`: Isolates all network communications from UI components. Configures Axios with `withCredentials: true` so HTTP-Only cookies are sent automatically. Contains custom NDJSON streaming reader.
- `server/app/database/models/`: Encapsulates database tables into Python objects using SQLAlchemy 2.0 ORM. Defines foreign key constraints, indexes, and relationships.
- `server/app/dependencies/`: Implements FastAPI's Dependency Injection pattern. Keeps routers clean by decoupling database session management, JWT authentication parsing, and app state retrieval.
- `server/app/routers/`: Serves as HTTP controllers. Converts raw HTTP requests into Pydantic models, calls service functions, handles HTTP exception mapping, and returns JSON or NDJSON stream responses.
- `server/app/schemas/`: Enforces strict contract validation on incoming request payloads and outgoing response structures using Pydantic v2.
- `server/app/services/`: The core domain logic layer. Completely decoupled from FastAPI routes and HTTP concerns, making business logic easy to test and maintain.

---

## 3. Architecture

### Layered Architecture

```
┌────────────────────────────────────────────────────────┐
│                   React 18 Frontend                    │
│    (Pages -> Components -> Contexts -> api.js)         │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP REST / NDJSON Stream
┌───────────────────────────▼────────────────────────────┐
│                    FastAPI Routers                     │
│  (auth_route, chat_route, video_route, billing_route)  │
└───────────────────────────┬────────────────────────────┘
                            │ Dependency Injection
┌───────────────────────────▼────────────────────────────┐
│                    Service Layer                       │
│ (chat_service, video_service, auth_service, rag, etc.) │
└───────────────┬───────────┴───────────────┬────────────┘
                │ SQL ORM Queries           │ Vector RAG Operations
┌───────────────▼───────────┐   ┌───────────▼────────────┐
│   Async SQLAlchemy ORM    │   │  LangChain + PGVector  │
└───────────────┬───────────┘   └───────────┬────────────┘
                │                           │
┌───────────────▼───────────────────────────▼────────────┐
│               PostgreSQL Database (Neon)               │
└────────────────────────────────────────────────────────┘
```

### Request Lifecycle
1. **HTTP Ingestion**: Client sends request (e.g. `POST /chat/messages/stream`) with HTTP-Only `access_token` cookie.
2. **CORS Validation**: FastAPI CORS middleware validates origin header (`https://tube-chat-web.vercel.app`, `localhost:5173`).
3. **Authentication Injection**: `get_optional_user` dependency intercepts the request, reads the `access_token` cookie, verifies the JWT signature, and attaches the `User` object (or `None` for guests).
4. **Rate Limit & Tier Validation**: `validate_limits()` checks:
   - For guests: In-memory IP rate limiter (`check_and_record_message_limit`).
   - For authenticated users: Database query counting existing messages/videos against plan limits (`free`: 15 msgs / 2 videos; `pro`: 100 msgs / 15 videos).
5. **Business Logic Execution**: The router delegates work to `chat_service.stream_message()`.
6. **RAG Vector Search**: The service invokes `retriever.ainvoke(question)`, searching `PGVector` using Maximal Marginal Relevance (MMR).
7. **LLM Inference**: Retrieved context + chat history + user question are passed into the LangChain Runnable pipeline to Groq (`llama-3.3-70b-versatile`).
8. **NDJSON Streaming**: Tokens are formatted as JSON lines (`{"type": "answer", "content": "..."}\n`) and yielded via FastAPI `StreamingResponse`.
9. **State Persistence**: Once streaming completes, user question and assistant answer are saved to the PostgreSQL `messages` table.

### Dependency Injection & Lifespan App State Pattern
To optimize memory and latency, heavy AI objects are initialized **once** during FastAPI application startup within the `lifespan` context manager in `main.py`:
```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    # One-time initialization of PGVector connection pool
    initialize_vector_store()
    # Cache global prompt template and LLM runnable instance
    app.state.prompt = build_prompt()
    app.state.llm = build_llm()
    yield
```
FastAPI routes access these shared instances cleanly via dependencies in `rag_dependency.py`:
```python
def get_llm(request: Request) -> BaseChatModel:
    return request.app.state.llm
```

---

## 4. Complete Request Flow

### End-to-End Request Journey: Ingesting a Video & Chatting

```mermaid
sequenceDiagram
    autonumber
    actor User as Client (React UI)
    participant Router as video_route.py / chat_route.py
    participant Auth as auth_dependency.py
    participant RateLimit as rate_limit_service.py
    participant Service as video_service.py / chat_service.py
    participant Youtube as YouTube Transcript API
    participant VectorStore as PGVector Store
    participant LLM as Groq LLM (Llama 3.3)
    participant DB as PostgreSQL DB

    Note over User, DB: STEP 1: Video Ingestion Phase
    User->>Router: POST /video/index { video_url }
    Router->>Auth: get_optional_user()
    Auth-->>Router: User / Guest State
    Router->>RateLimit: check_and_record_video_limit(client_ip)
    RateLimit-->>Router: Limit OK
    Router->>Service: index_video_for_user(url, user, db)
    Service->>DB: Check if video already indexed
    alt Video Not Indexed
        Service->>Youtube: fetch_transcript(youtube_id)
        Youtube-->>Service: Raw Transcript Snippets
        Service->>Service: split_transcript (chunk_size=3000, overlap=300)
        Service->>VectorStore: index_transcript(chunks)
        VectorStore->>VectorStore: Batched Embeddings (batch_size=5, 1s delay)
        VectorStore-->>Service: Vectors Stored in PGVector
        Service->>DB: Create Video & ChatSession records
    end
    Service-->>Router: Video & ChatSession Objects
    Router-->>User: HTTP 200 { video, session }

    Note over User, DB: STEP 2: Chat Streaming Phase
    User->>Router: POST /chat/messages/stream { question, session_id }
    Router->>Service: validate_limits(request, db, user, client_ip)
    Service-->>Router: Validation Passed
    Router->>Service: stream_message(request, db, llm, prompt, user)
    Service-->>User: Yield NDJSON Header: {"type": "session", "session_id": "..."}
    Service->>VectorStore: get_retriever(youtube_id).ainvoke(question)
    VectorStore-->>Service: Top 5 Relevant Chunks (MMR)
    Service->>DB: get_chat_history(session_id)
    DB-->>Service: Last 10 Messages
    Service->>LLM: astream(context + chat_history + question)
    loop Token Streaming
        LLM-->>Service: Streamed Token Chunk
        Service-->>User: Yield NDJSON: {"type": "answer", "content": "token"}
    end
    Service->>DB: Insert Message(role=USER) & Message(role=ASSISTANT)
    Service-->>User: Yield NDJSON: {"type": "done"}
```

---

## 5. Database Architecture & Schemas

### Relational Entity-Relationship Diagram

```mermaid
erDiagram
    users ||--o| subscriptions : "has one"
    users ||--o{ chat_sessions : "owns (nullable for guests)"
    videos ||--o{ chat_sessions : "referenced by"
    chat_sessions ||--o{ messages : "contains"
    
    users {
        uuid id PK
        string email UK
        string hashed_password
        datetime created_at
        datetime updated_at
    }

    subscriptions {
        uuid id PK
        uuid user_id FK, UK
        string paddle_customer_id
        string paddle_subscription_id
        string plan
        string status
        datetime current_period_end
        datetime created_at
        datetime updated_at
    }

    videos {
        uuid id PK
        string youtube_id UK
        string title
        datetime created_at
    }

    chat_sessions {
        uuid id PK
        uuid user_id FK "Nullable for Guests"
        uuid video_id FK
        string title
        datetime created_at
        datetime updated_at
    }

    messages {
        uuid id PK
        uuid session_id FK
        enum role "USER | ASSISTANT"
        text content
        datetime created_at
    }
```

### Table Specifications & Field Rationale

#### 1. `users`
- `id` (`UUID`): Primary key, auto-generated UUID v4. Using UUIDs prevents enumeration attacks.
- `email` (`VARCHAR(255)`): Unique user email. Guest user emails end with `@guest.tubechat.ai`.
- `hashed_password` (`VARCHAR(255)`): Bcrypt password hash. Never stored for guest users.

#### 2. `subscriptions`
- `id` (`UUID`): Primary key.
- `user_id` (`UUID`): Foreign key referencing `users.id` (`ON DELETE CASCADE`). Unique constraint ensures 1-to-1 relationship.
- `paddle_customer_id` / `paddle_subscription_id` (`VARCHAR`): External Paddle reference IDs for webhook matching.
- `plan` (`VARCHAR(50)`): Active tier (`"free"` or `"pro"`). Controls video and message indexing limits.
- `status` (`VARCHAR(50)`): Active status (`"active"`, `"canceled"`, `"past_due"`, `"none"`).

#### 3. `videos`
- `id` (`UUID`): Primary key.
- `youtube_id` (`VARCHAR(50)`): Unique 11-character YouTube video ID (e.g. `R8_veQiYBjI`). Guarantees a YouTube video is indexed only once globally.

#### 4. `chat_sessions`
- `id` (`UUID`): Primary key.
- `user_id` (`UUID`, Nullable): Foreign key referencing `users.id`. Set to `NULL` for guest users to prevent exposing saved chat history to unauthenticated guests.
- `video_id` (`UUID`): Foreign key referencing `videos.id`.

#### 5. `messages`
- `id` (`UUID`): Primary key.
- `session_id` (`UUID`): Foreign key referencing `chat_sessions.id` (`ON DELETE CASCADE`).
- `role` (`ENUM`): Message sender type (`'user'` or `'assistant'`).
- `content` (`TEXT`): Full text content of the message.

---

## 6. Authentication & Security System

### JWT Strategy & Cookie Configuration
Authentication uses signed JSON Web Tokens (JWT) using `HS256`. Tokens are set directly in `httpOnly` cookies by FastAPI, making them inaccessible to client-side JavaScript (`document.cookie`), completely mitigating XSS token theft.

```python
response.set_cookie(
    key="access_token",
    value=f"Bearer {token}",
    httponly=True,
    samesite="lax",
    secure=True, # In production
    max_age=7 * 86400 # 7 days
)
```

### Guest User Isolation Logic
Guest accounts are detected via the helper function `is_guest_user(email)`:
```python
def is_guest_user(email: str | None) -> bool:
    if not email:
        return True
    return email.endswith("@guest.tubechat.ai")
```
- **History Hiding**: In `chat_service.py`, when a guest user queries a session, historical messages are wiped (`messages=[]`), enforcing the limitation that guest sessions do not preserve visible history across page reloads.
- **Route Guarding**: The frontend `PricingPage.jsx` intercepts guest users attempting to navigate to `/pricing` and redirects them immediately to home (`/`).

---

## 7. Chat Architecture & Memory

### Response Streaming Protocol (NDJSON)
FastAPI streams responses as newline-delimited JSON objects over a standard HTTP response. The stream emits four message types:

1. **Session Announcement** (sent first so client receives new session ID):
   `{"type": "session", "session_id": "97586b04-f031-4720-af06-ae2ca87d521d"}`
2. **Answer Chunk** (streamed live token by token):
   `{"type": "answer", "content": "The video explains..."}`
3. **Completion Marker**:
   `{"type": "done"}`
4. **Stream Error**:
   `{"type": "error", "content": "An error occurred."}`

### Context & Memory Handling
Conversational context is maintained by fetching the last 10 messages from PostgreSQL using `get_chat_history()` and passing them as `MessagesPlaceholder(variable_name="chat_history")` into the LangChain prompt template.

---

## 8. RAG Pipeline (Retrieval-Augmented Generation)

### Step-by-Step RAG Execution Flow

```mermaid
flowchart TD
    A[YouTube URL] --> B[youtube_transcript_api]
    B --> C[Full Transcript Text]
    C --> D["RecursiveCharacterTextSplitter (chunk_size=3000, overlap=300)"]
    D --> E["Batched Embeddings (batch_size=5, 1s delay)"]
    E --> F["Google Generative AI (embedding-001)"]
    F --> G["PGVector Database (langchain_pg_embedding)"]
    
    H[User Question] --> I[MMR Retriever (k=5)]
    G --> I
    I --> J[Top 5 Relevant Chunks]
    J --> K[Prompt Template + Chat History]
    K --> L[Groq / Gemini LLM]
    L --> M[Stream Tokens to User]
```

### Batching & Rate Limit Resilience
To prevent hitting API rate limits (15 RPM on Google AI Studio free tier), vector indexing in `vector_store.py` implements **batched processing with exponential backoff retries**:

```python
async def index_transcript(chunks: list[Document], batch_size: int = 5, delay_seconds: float = 1.0) -> None:
    vector_store = get_vector_store()
    for i in range(0, len(chunks), batch_size):
        batch = chunks[i : i + batch_size]
        for attempt in range(5):
            try:
                await vector_store.aadd_documents(batch)
                break
            except Exception as e:
                if "429" in str(e) or "resource_exhausted" in str(e):
                    await asyncio.sleep((2 ** attempt) + 1)
                else:
                    raise e
        if i + batch_size < len(chunks):
            await asyncio.sleep(delay_seconds)
```

---

## 9. Important Modules Reference

### 1. `app.services.rag`
- **Purpose**: Constructs the core RAG components (embeddings, prompt template, LLM, LCEL pipeline).
- **Key Functions**:
  - `build_embeddings()`: Returns `GoogleGenerativeAIEmbeddings(model="models/embedding-001")`.
  - `build_llm()`: Returns `ChatGroq(model="llama-3.3-70b-versatile", temperature=0)`.
  - `create_rag_pipeline(retriever, llm, prompt)`: Constructs the async LCEL Runnable chain.

### 2. `app.services.rate_limit_service`
- **Purpose**: Enforces in-memory sliding window IP rate limits for unauthenticated guest users.
- **Key Functions**:
  - `check_and_record_message_limit(ip)`: Enforces max 20 messages per 24 hours per IP.
  - `check_and_record_video_limit(ip)`: Enforces max 2 videos indexed per 24 hours per IP.

### 3. `app.services.paddle_service`
- **Purpose**: Validates Paddle webhook HMAC-SHA256 signatures and processes subscription lifecycle events.
- **Key Functions**:
  - `verify_paddle_signature(raw_body, signature_header)`: Verifies request authenticity using `PADDLE_WEBHOOK_SECRET`.
  - `handle_paddle_webhook(request, db)`: Updates database subscription records upon `subscription.created`, `subscription.updated`, or `subscription.cancelled`.

---

## 10. Configuration & Environment Variables

| Variable | Required | Purpose | Example Value |
|---|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql+asyncpg://user:pass@ep-host.neon.tech/dbname` |
| `JWT_SECRET` | Yes | HMAC secret key for signing JWT tokens | `super-secret-jwt-key-32-chars-min` |
| `GOOGLE_API_KEY` | Yes | Google AI Studio key for embeddings | `AIzaSy...` |
| `GROQ_API_KEY` | Yes | Groq Cloud API key for Llama 3.3 LLM | `gsk_...` |
| `PADDLE_WEBHOOK_SECRET` | Yes | Webhook verification secret from Paddle | `pdl_ntf_set_...` |
| `PADDLE_PRO_PRICE_ID` | Yes | Price ID for Pro plan validation | `pri_01h...` |
| `VITE_API_BASE_URL` | Yes (Client) | Backend URL burned into React build | `https://tubechat-api.onrender.com` |

---

## 11. API Specification

### Auth Endpoints

#### `POST /auth/register`
- **Request Body**: `{"email": "user@example.com", "password": "SecretPassword123"}`
- **Response**: `{"id": "...", "email": "user@example.com", "is_guest": false}` + sets `access_token` cookie.

#### `POST /auth/login`
- **Request Body**: `{"email": "user@example.com", "password": "SecretPassword123"}`
- **Response**: User object + sets `access_token` cookie.

#### `GET /auth/me`
- **Headers**: Cookie `access_token`
- **Response**: User profile schema (`id`, `email`, `is_guest`).

### Video Endpoints

#### `POST /video/index`
- **Request Body**: `{"video_url": "https://www.youtube.com/watch?v=R8_veQiYBjI"}`
- **Response**: `{"video": {...}, "session": {...}}`

### Chat Endpoints

#### `POST /chat/messages/stream`
- **Request Body**: `{"question": "Summarize key points", "youtube_id": "R8_veQiYBjI", "session_id": "..."}`
- **Response**: `StreamingResponse` (NDJSON stream).

---

## 12. Frontend Architecture

### State Management Hierarchy

```
       [AuthContext]  -->  (User, Login, Register, Logout)
            │
       [AppContext]   -->  (Sidebar open/close, Active Video ID)
            │
 ┌──────────┴──────────┐
 │                     │
ChatPage            HomePage / PricingPage
 (Messages, Stream)   (URL Ingestion, Paddle Checkout)
```

### Stream Reading Implementation (`api.js`)
The client reads NDJSON stream chunks line-by-line using native browser `fetch` and `ReadableStream.getReader()`:
```javascript
const reader = response.body.getReader();
const decoder = new TextDecoder();
let buffer = "";

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  buffer += decoder.decode(value, { stream: true });
  const lines = buffer.split("\n");
  buffer = lines.pop(); // keep trailing partial line
  
  for (const line of lines) {
    if (!line.trim()) continue;
    const msg = JSON.parse(line);
    if (msg.type === "answer") onToken(msg.content);
    else if (msg.type === "session") onSession(msg.session_id);
    else if (msg.type === "done") onDone();
  }
}
```

---

## 13. External Services Integrations

- **Google Generative AI**: Generates 768-dimensional text embeddings (`models/embedding-001`).
- **Groq Cloud**: Provides low-latency inference for `llama-3.3-70b-versatile`.
- **YouTube Transcript API**: Downloads raw closed captions and transcripts.
- **Neon PostgreSQL + PGVector**: Vector store host with HNSW indexing.
- **Paddle**: Manages SaaS checkout overlay and subscription lifecycle events.

---

## 14. Deployment Pipeline

### Deployment on Render (Backend)
- **Runtime Lock**: Locked to Python `3.11.9` via `.python-version` files to avoid Python 3.14 alpha build incompatibilities.
- **Build Command**: `pip install -r server/requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Memory Footprint**: Optimized to run under Render's **512MB RAM free tier** by avoiding heavy local PyTorch dependencies and using API-based embeddings.

### Deployment on Vercel (Frontend)
- **Framework**: Vite SPA
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Env Var Requirement**: `VITE_API_BASE_URL` **must** be set prior to trigger build (Vite bakes env vars at compile time).

---

## 15. Design Decisions & Trade-offs

### 1. HTTP-Only Cookies vs LocalStorage for JWT
- **Decision**: HTTP-Only cookies.
- **Why**: Prevents malicious scripts (XSS) from reading access tokens.
- **Trade-off**: Requires CORS `allow_credentials=True` configuration and explicit domain management.

### 2. API-Based Embeddings vs Local Sentence Transformers
- **Decision**: Switched from `sentence-transformers` (HuggingFace) to `GoogleGenerativeAIEmbeddings`.
- **Why**: `torch` and HuggingFace models required >1.5GB RAM, causing immediate Out-Of-Memory (OOM) crashes on 512MB free hosting instances.
- **Trade-off**: Requires an external API call, but eliminated memory issues entirely.

### 3. In-Memory IP Rate Limiter vs Redis
- **Decision**: In-memory `defaultdict` sliding window.
- **Why**: Eliminates external Redis infrastructure costs for a hobby/portfolio deployment.
- **Trade-off**: Memory resets on server restart, but perfectly sufficient for single-instance web services.

---

## 16. Known Issues & Technical Debt

1. **In-Memory Rate Limiting Scale**: If horizontally scaled to multiple backend instances, in-memory IP rate limits would not be shared. (Fix: Upgrade to Redis via `redis-py` if scaling).
2. **PGVector Table Clearing on Embedding Model Switch**: Changing embedding providers requires executing `DELETE FROM langchain_pg_embedding;` due to vector dimension mismatches (e.g. 384 vs 768 dims).

---

## 17. How To Extend

### Adding a New LLM Provider (e.g. Anthropic Claude)
1. Add `langchain-anthropic` to `server/requirements.txt`.
2. Update `build_llm()` in `server/app/services/rag.py`:
   ```python
   from langchain_anthropic import ChatAnthropic
   
   def build_llm() -> BaseChatModel:
       return ChatAnthropic(model="claude-3-5-sonnet-20241022")
   ```
3. Set `ANTHROPIC_API_KEY` in environment variables.

### Supporting Document Uploads (e.g. PDFs)
1. Add `pypdf` to `requirements.txt`.
2. Create a new service `server/app/services/pdf_service.py` to extract text from uploaded files using `PyPDFLoader`.
3. Reuse `vector_store.py`'s `index_transcript()` function to chunk and store PDF embeddings in the existing PGVector store.

---

## 18. Glossary

- **RAG (Retrieval-Augmented Generation)**: The process of retrieving relevant document chunks from a vector database to ground LLM responses in verifiable context.
- **Embedding**: A numerical vector representation (e.g. 768 floating point numbers) capturing the semantic meaning of a text segment.
- **PGVector**: A PostgreSQL extension that enables vector storage and high-speed vector similarity searches directly within relational SQL databases.
- **MMR (Maximal Marginal Relevance)**: A search algorithm that balances relevance to the query with diversity among retrieved results to avoid redundant context chunks.
- **LCEL (LangChain Expression Language)**: A declarative composition framework for chaining prompts, models, and output parsers into streaming pipelines.
- **NDJSON**: Newline-Delimited JSON, a format where each line in an HTTP response is an independent, valid JSON object.
