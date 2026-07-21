from sqlalchemy.orm import Session

from app.database.models.video_model import Video


def get_video_by_youtube_id(db: Session, youtube_id: str) -> Video | None:
    return db.query(Video).filter(Video.youtube_id == youtube_id).first()


def create_video(
    db: Session,
    **kwargs,
) -> Video:

    video = Video(**kwargs)
    db.add(video)
    try:
        db.commit()
    except Exception as e:
        db.rollback()

    db.refresh(video)

    return video
