from fastapi import APIRouter,Depends
from sqlalchemy.orm import Session


from app.schemas.auth_schema import UserRegisterRequest, UserRegisterResponse, UserLoginRequest, UserLoginResponse
from app.services.auth_service import register_user, login_user
from app.database.database import get_db
    

router = APIRouter()


@router.post("/register", response_model=UserRegisterResponse)
def register(request: UserRegisterRequest, db: Session = Depends(get_db)):
    return register_user(request, db)


@router.post("/login", response_model=UserLoginResponse)
def login(request: UserLoginRequest, db: Session = Depends(get_db)):
    return login_user(request, db)
   

   
   