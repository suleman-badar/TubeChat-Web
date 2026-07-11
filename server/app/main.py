from fastapi import FastAPI  
from app.routers.video import router as video_router
from app.routers.chat import router as chat_router


app = FastAPI()

@app.get("/")
def main():
    return {
        "message": "App running"
    }


app.include_router(video_router, prefix="/videos", tags=["Videos"])
app.include_router(chat_router, prefix="/chat", tags=["Chat"])

print("Hello, FastAPI!")