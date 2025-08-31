from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from utils.database import Base

class Business(Base):
    __tablename__ = "businesses"
    id = Column(Integer, primary_key=True)
    name = Column(String(128), nullable=False, unique=True)
    config = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    users = relationship("User", back_populates="business")
    products = relationship("Product", back_populates="business")
    leads = relationship("Lead", back_populates="business")
    chats = relationship("Chat", back_populates="business")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    business_id = Column(Integer, ForeignKey("businesses.id"), nullable=False)
    fullname = Column(String(128), nullable=False)
    email = Column(String(128), unique=True, index=True, nullable=False)
    password_hash = Column(String(256), nullable=False)
    tokens = Column(Integer, default=10)
    created_at = Column(DateTime, server_default=func.now())
    is_verified = Column(Boolean, default=False)
    verification_token = Column(String(256))
    reset_token = Column(String(256))
    reset_token_expiry = Column(DateTime)
    business = relationship("Business", back_populates="users", lazy="joined")
    leads = relationship("Lead", back_populates="user")
    chats = relationship("Chat", back_populates="user")

class Lead(Base):
    __tablename__ = "leads"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    business_id = Column(Integer, ForeignKey("businesses.id"))
    name = Column(String(128))
    email = Column(String(128))
    phone = Column(String(32))
    message = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    user = relationship("User", back_populates="leads")
    business = relationship("Business", back_populates="leads")

class Chat(Base):
    __tablename__ = "chats"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    business_id = Column(Integer, ForeignKey("businesses.id"))
    message = Column(Text)
    response = Column(Text)
    emotion = Column(String(64))
    sales_stage = Column(String(64))
    is_sale = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    user = relationship("User", back_populates="chats")
    business = relationship("Business", back_populates="chats")

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True)
    business_id = Column(Integer, ForeignKey("businesses.id"))
    name = Column(String(128), nullable=False)
    description = Column(Text)
    price = Column(Float)
    image_url = Column(String(256))
    tags = Column(String(256))  # "black,sporty,shoes"
    created_at = Column(DateTime, server_default=func.now())
    business = relationship("Business", back_populates="products")

class TokenTransaction(Base):
    __tablename__ = "token_transactions"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Integer)
    type = Column(String(32))  # "message", "sale", "purchase"
    detail = Column(String(256))
    created_at = Column(DateTime, server_default=func.now())

class SocialMediaToken(Base):
    __tablename__ = "social_media_tokens"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    platform = Column(String(50), nullable=False)  # 'facebook', 'instagram', etc.
    access_token = Column(String(512), nullable=False)
    refresh_token = Column(String(512))
    expires_in = Column(Integer)
    created_at = Column(DateTime, server_default=func.now())
    user = relationship("User")
