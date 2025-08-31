from datetime import datetime, timedelta
from jose import jwt
from config import settings 

def create_email_token(data: dict):
    """Create a JWT token for email verification/reset with 1-hour expiration"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=1)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def verify_email_token(token: str):
    """Verify and decode an email token, returns payload or None if invalid"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except jwt.JWTError:
        return None