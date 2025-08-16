# test_email.py
import asyncio
import os
from dotenv import load_dotenv
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType

load_dotenv()

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

async def send_test_email():
    message = MessageSchema(
        subject="FastAPI Mail Test",
        recipients=[""],  
        body="This is a test message from the standalone script.",
        subtype=MessageType.html
    )

    fm = FastMail(conf)
    try:
        print("Attempting to send email...")
        await fm.send_message(message)
        print("Email sent successfully!")
    except Exception as e:
        print("Failed to send email.")
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(send_test_email())