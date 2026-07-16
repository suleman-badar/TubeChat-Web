from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.vector_store import get_retriever
from app.services.rag import create_rag_pipeline


router = APIRouter()


class ChatRequest(BaseModel):
    video_id: str = Field(..., description="The ID of the video to chat about")
    question: str = Field(..., description="The question to ask the bot")


@router.get("/")      
def chat():
    return {
        "message": "This endpoint will show the user a form ot chat with the bot"
    }

@router.post("/")      
def chat(chat: ChatRequest):
    video_id = chat.video_id
    question = chat.question
    retriever = get_retriever(video_id)
    if(retriever):
        rag_pipeline, prompt, llm = create_rag_pipeline(retriever)
        response = rag_pipeline.invoke({"question": question})
        return {
            "response": response,
            "video_id": video_id,
            "question": question
        }
    else:
        return {
            "error": "Retriever not found for the given video ID"
        }

