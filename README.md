# TubeChat 

TubeChat is a Retrieval Augmented Generation (RAG) web application that allows users to index YouTube videos via their URL, transcribe their content and converse with an AI chatbot about the video's details using contextual chunk retrieval.

---

##  Tech Stack & Architecture

```
                      +-------------------+
                      |   React (Vite)    |  <-- Frontend Client
                      +---------+---------+
                                |
                                | HTTP REST APIs
                                v
                      +-------------------+
                      |   FastAPI App     |  <-- Backend Server
                      +----+---------+----+
                           |         |
      Metadata/Chat logs   |         | Semantic transcript queries
                           v         v
                     +---------+ +---------+
                     |  Postgres | | ChromaDB  |  <-- Vector Database
                     | (NeonDB)| | (Local) |
                     +---------+ +---------+
```

### Frontend
- **Framework:** React 19 (built using Vite)
- **Routing:** React Router DOM (v7)
- **Form Management:** React Hook Form
- **HTTP Client:** Axios
- **Styling:** Vanilla CSS (curated modern theme layout)

### Backend
- **Framework:** FastAPI (Python 3.11+)
- **RAG Framework:** LangChain (LangChain-Chroma, LangChain-OpenAI, LangChain-HuggingFace)
- **Vector DB:** ChromaDB (Persisted locally in `./chroma_db`)
- **Relational DB:** Neon (PostgreSQL) + SQLAlchemy ORM (for users, chat sessions, and message history)
- **Migration Tool:** Alembic
- **Transcript Extraction:** `youtube-transcript-api`
- **Embedding Model:** `sentence-transformers/all-MiniLM-L6-v2` (hosted locally via HuggingFaceEmbeddings)
- **Language Model:** ChatOpenAI (configured to run against an OpenAI-compatible AWS Bedrock proxy)

---

##  Repository Structure

```
YoutubeChatbot/
├── client/                     # React frontend code
│   ├── src/
│   │   ├── components/         # Reusable UI widgets (Composer, Sidebar, Message List)
│   │   ├── pages/              # Page layouts (Home, Indexing form, Chat panel)
│   │   ├── services/           # Axios API layer configurations
│   │   └── styles/             # Modular CSS stylesheet definitions
│   └── package.json
│
└── server/                     # FastAPI backend code
    ├── app/
    │   ├── database/           # SQLAlchemy models & database configuration
    │   ├── routers/            # FastAPI route handlers (/video, /chat)
    │   ├── schemas/            # Pydantic schemas for request/response serialization
    │   └── services/           # Core logic (RAG pipeline, transcript fetching, video indexing)
    ├── alembic/                # DB schema version control files
    └── requirements.txt
```

---

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js (v18+)
- Postgres database (Neon instance or local)

---

### Backend Setup

1. **Navigate to the server directory:**
   ```bash
   cd server
   ```

2. **Create and activate a virtual environment:**
   ```bash
   # Windows:
   python -m venv venv
   .\venv\Scripts\activate

   # macOS/Linux:
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Variables Config:**
   Create a `.env` file in the `server/` directory:
   ```env
   DATABASE_URL=postgresql+psycopg://<username>:<password>@<host>/<dbname>?sslmode=require
   OPENAI_API_KEY=your_openai_or_proxy_api_key
   OPENAI_BASE_URL=https://your-custom-openai-compatible-endpoint/v1
   OPENAI_MODEL=gpt-4o  # or your target model name
   ```

5. **Run database migrations:**
   ```bash
   alembic upgrade head
   ```

6. **Start the server:**
   ```bash
   uvicorn app.main:app --reload
   ```
   The backend API will run at [http://127.0.0.1:8000](http://127.0.0.1:8000).

---

### Frontend Setup

1. **Navigate to the client directory:**
   ```bash
   cd client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the Vite development server:**
   ```bash
   npm run dev
   ```
   The application will run at [http://localhost:5173](http://localhost:5173).

---

## 🔄 Core User Flow

1. **Index Video:** The user submits a YouTube link via the React form. The backend extracts the video ID, fetches the English transcript, chunks the text, embeds it using local sentence-transformers, and inserts the documents into ChromaDB.
2. **Start Chat:** The frontend routes the user to the `/chat` page. A persistent chat session is created in PostgreSQL.
3. **Chatting:** When the user enters a question, the backend retrieves the top-3 most similar transcript chunks from ChromaDB, constructs a context-aware prompt, feeds it to the language model, and streams the answer back, keeping the chat history persisted securely in PostgreSQL.
