from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

import bcrypt

from app.database.models.user_model import User
from server.app.schemas.auth_schema import UserRegisterResponse, UserLoginResponse, UserRegisterRequest, UserLoginRequest

def register_user(request: UserRegisterRequest, db: Session):
    email= request.email
    password= request.password
    confirmPassword= request.confirmPassword
    
    if password != confirmPassword:
        raise HTTPException(
            status_code=400,
            detail="Passwords do not match"
        )
    
    existing_user = db.scalar(
        select(User).where(User.email == email)
    )
    if existing_user:
       raise HTTPException(
           status_code=409,
           detail="Email already registered"
        )
       
    hashed_password = bcrypt.hashpw(
        password.encode(),
        bcrypt.gensalt()
    ).decode()
    
    user = User(
        email=email,
        hashed_password=hashed_password
    )

    db.add(user)
    try:
        db.commit()
    except:
        db.rollback()
        raise
    db.refresh(user)
    
    return UserRegisterResponse(
        email=user.email,
        message= "User registered successfully",
    )
    

def login_user(request: UserLoginRequest, db: Session):
    email = request.email
    password = request.password
    
    user = db.scalar(
        select(User).where(User.email == email)
    )
    
    if not user:
        raise HTTPException(
            status_code=404,
            detail="Invalid User or Password"
        )
    
    if not bcrypt.checkpw(password.encode(), user.hashed_password.encode()):
        raise HTTPException(
            status_code=401,
            detail="Invalid password"
        )
    
    return UserLoginResponse(
        email=user.email,
        message="Login successful"
    )