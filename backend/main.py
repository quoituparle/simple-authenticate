from datetime import datetime, timedelta, timezone
import random
import string

from fastapi.responses import JSONResponse
import jwt, uuid, pymysql, os
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jwt.exceptions import InvalidTokenError
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr

from .models import UserRegister, UserLogin, User, UserBase

from sqlmodel import create_engine, Session, SQLModel, select
from sqlalchemy.exc import IntegrityError

from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType

from typing import List

from dotenv import load_dotenv

load_dotenv()
password = os.getenv("password")

DATABASE_URL = f"mysql+pymysql://root:{password}@127.0.0.1/USERDB"

SECRET_KEY =os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

class Token(BaseModel):
    access_token: str
    token_type: str

class EmailSchema(BaseModel):
    email: List[EmailStr]

conf = ConnectionConfig(
    MAIL_USERNAME = os.getenv("mail_username"),
    MAIL_PASSWORD = os.getenv("mail_password"), 
    MAIL_FROM = os.getenv("mail_from"),
    MAIL_PORT = 587,
    MAIL_SERVER = os.getenv("mail_server"),
    MAIL_STARTTLS = True,
    MAIL_SSL_TLS = False,
    USE_CREDENTIALS = True,
    VALIDATE_CERTS = True
)
fm = FastMail(conf)


engine = create_engine(DATABASE_URL, echo=True)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

app = FastAPI()

def get_password_hash(password):
    return pwd_context.hash(password)

def get_db():
    with Session(engine) as session:
        yield session


@app.on_event("startup")
def on_startup():
    create_db_and_tables()

class UserRead(UserBase):
    id: uuid.UUID
    full_name: str | None = None 

def generate_verification_code(length: int=6):
    return "".join(random.choices(string.digits, k=length))

@app.post('/register/', response_model=UserRead, status_code=201)
async def Registration(user_data: UserRegister, db: Session = Depends(get_db)):
    existing_user = get_user(db, user_data.email)
    if existing_user and existing_user.is_verified:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    
    code = generate_verification_code()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)

    db_user = User(        
    email = user_data.email,
    hashed_password = get_password_hash(user_data.password),
    full_name = user_data.full_name,
    )
    db.add(db_user)

    db_user.verification_code = code
    db_user.code_expires_at = expires_at

    try:
        db.commit()
        db.refresh(db_user)
    
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    except Exception as e:
        db.rollback()
        print(e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An internal error has occured")
    
    message = MessageSchema(
        subject="Verification Code",
        recipients=[user_data.email],
        body=f"Your verification code is {code}, code will be expired in 15 minutes.",
        subtype=MessageType.html,
    )

    try:
        await fm.send_message(message)

    except Exception as e:
        print(e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to send code")
        
    return db_user

class VerificationData(BaseModel):
    email: EmailStr
    code: str

@app.post('/verify-email/')
async def verify_email(data: VerificationData, db: Session = Depends(get_db)):
    user = get_user(db, data.email)

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.is_verified:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User has verified")
    if user.verification_code != data.code:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid verification code")
    if datetime.now(timezone.utc) > user.code_expires_at.replace(tzinfo=timezone.utc):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Time expired, please try again")
    
    user.is_verified = True
    user.verification_code = None
    user.code_expires_at = None
    db.add(user)
    db.commit()


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_user(db: Session, email: str) -> User | None:
    statement = select(User).where(User.email == email)
    user = db.exec(statement).first()
    return user
    
def authenticate_user(db: Session, email: str, password: str) -> User | None:
    user = get_user(db, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@app.post('/login/')
async def Login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, login_data.email, login_data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password", 
            headers={"WWW-Authenticate": "Bearer"},
            )
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email not verified. Please verify your email first."
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
    data={"sub": user.email}, expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer")

class ResendEmail(BaseModel):
    email: EmailStr

@app.post('/resend-verification-email/')
async def resend_verification_email(request: ResendEmail, db: Session = Depends(get_db)):
    user = get_user(db, request.email)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.is_verified:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email is already verified")
    
    code = generate_verification_code()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)
    user.verification_code = code
    user.code_expires_at = expires_at
    db.add(user)
    db.commit()

    message = MessageSchema(
        subject="New Verification Code",
        recipients=[user.email],
        body=f"Your new verification code is {code}. It expires in 15 minutes.",
        subtype=MessageType.html,
    )
    try:
        await fm.send_message(message)
        return {"message": "A new verification code has been sent."}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Failed to send email.")
