from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.routers.video_route import router as video_router
from app.routers.chat_route import router as chat_router
from app.routers.auth_route import router as auth_router
from app.routers.paddle_route import router as paddle_router
from app.routers.billing_route import router as billing_router
from app.services.vector_store import initialize_vector_store
from app.services.rag import build_prompt, build_llm

# Lifespan event to initialize the vector store on startup for just one time
# rather than creating N instances of the vector store for each request from the user. For details see ARC.md file


@asynccontextmanager
async def lifespan(app: FastAPI):
    # using sequential intilization here bcz it is a one time task and
    # the obj is an  internal implementation of the app and not exposed to the user
    initialize_vector_store()

    # The obj needs to reach a route handler so we are storing it in the app.state.
    app.state.prompt = build_prompt()
    app.state.llm = build_llm()

    yield
    # for any cleanup tasks when the app shuts down, if needed


app = FastAPI(lifespan=lifespan)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        # "https://tube-chat-web.vercel.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def main():
    return {"message": "App running"}


app.include_router(auth_router)
app.include_router(video_router)
app.include_router(chat_router)
app.include_router(paddle_router)
app.include_router(billing_router)

# print("Hello, FastAPI!")
