from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:5173/",
    "http://localhost:5173/register/",
    "http://localhost:5173/login/",
    "http://localhost:5173/verify-email/",
    'http://localhost:5173/api/resend-verification-email/',
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)