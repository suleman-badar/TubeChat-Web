from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.video import router as video_router
from app.routers.chat import router as chat_router


app = FastAPI()

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
    return {
        "message": "App running"
    }


app.include_router(video_router, prefix="/videos", tags=["Videos"])
app.include_router(chat_router, prefix="/chat", tags=["Chat"])

print("Hello, FastAPI!")