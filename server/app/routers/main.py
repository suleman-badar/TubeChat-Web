from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.routers.video_route import router as video_router
from app.routers.chat_route import router as chat_router
from app.services.vector_store import initialize_vector_store
from app.services import vector_store

app = FastAPI()


# Lifespan event to initialize the vector store on startup for just one time
# rather than creating N instances of the vector store for each request from the user. For details see ARC.md file


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("initialize_vector_store() called")
    print("module:", __name__)
    print("id:", id(vector_store))
    initialize_vector_store()
    print("initialized")
    print(id(vector_store))
    yield
    # for any cleanup tasks when the app shuts down, if needed


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
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


app.include_router(video_router, prefix="/videos", tags=["Videos"])
app.include_router(chat_router, prefix="/chat", tags=["Chat"])

print("Hello, FastAPI!")
