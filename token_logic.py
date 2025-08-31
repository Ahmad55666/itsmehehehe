from config import settings
from models import User, TokenTransaction, Business
from sqlalchemy.orm import Session, joinedload
from .database import get_db
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException, status
import logging
from datetime import datetime, timedelta
from pathlib import Path

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
logger = logging.getLogger(__name__)

def verification_bypass_enabled():
    """Check if verification bypass is enabled"""
    bypass_file = Path(__file__).parent.parent / 'temporary_verification_off'
    return bypass_file.exists()

def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        if verification_bypass_enabled():
            logger.warning("JWT verification failed, but bypass is enabled. Returning first user.")
            user = db.query(User).options(joinedload(User.business)).first()
            if not user:
                raise HTTPException(status_code=404, detail="No users found in bypass mode")
            return user
        raise credentials_exception

    user = db.query(User).options(joinedload(User.business)).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

def deduct_tokens(db: Session, user: User, amount: int, tx_type: str, detail: str):
    try:
        if user.tokens < amount:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail="Insufficient tokens"
            )
            
        user.tokens -= amount
        tx = TokenTransaction(
            user_id=user.id,
            amount=-amount,
            type=tx_type,
            detail=detail
        )
        db.add(tx)
        db.commit()
        db.refresh(user)
        return user.tokens
    except Exception as e:
        db.rollback()
        logger.error(f"Token deduction failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Token deduction failed: {str(e)}"
        )
