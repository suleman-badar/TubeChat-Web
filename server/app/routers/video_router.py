from fastapi import APIRouter
from pydantic import BaseModel, Field
from fastapi.responses import RedirectResponse


from app.services.transcript import transcipt
from app.services.vector_store import get_retriever, index_video
from app.services.extract_video_id import extract_video_id

router = APIRouter()

class indexVideoRequest(BaseModel):
    videoURL: str = Field(..., description="The ID of the video to index")


@router.get("/")      
def get_video():
    return {
        "message": "This endpoint will get show video link form to the user"
    }


@router.post("/index")      
def index(video: indexVideoRequest):
    url=video.videoURL
    video_id = extract_video_id(url)
    chunks = transcipt(video_id)

    if(chunks):
        index_video(video_id, chunks)
        retriever = get_retriever(video_id)
        if(retriever):
           return{
                "status": "success",
                 "video_id": video_id,
            }
        else:
            return{
                "status": "error in retriever creation"
            }
    else:
        return{
            "status": "error in transcript extraction"
        }
    

