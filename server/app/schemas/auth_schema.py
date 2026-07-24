from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from uuid import UUID


class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(
        ..., min_length=8, max_length=128, description="The password of the user"
    )
    confirmPassword: str = Field(
        ..., min_length=8, description="The password confirmation of the user"
    )


class UserRegisterResponse(BaseModel):
    email: EmailStr
    message: str = Field(..., description="The message to be returned to the user")


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, description="The password of the user")


class UserLoginResponse(BaseModel):
    email: EmailStr
    message: str = Field(..., description="The message to be returned to the user")


class UserMeResponse(BaseModel):
    id: UUID
    email: EmailStr
    created_at: datetime

    model_config = {
        "from_attributes": True,
    }
