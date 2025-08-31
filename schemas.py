from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime

# Business schemas
class BusinessBase(BaseModel):
    name: str
    config: Optional[str] = None

class BusinessCreate(BusinessBase):
    pass

class Business(BusinessBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class BusinessConfig(BaseModel):
    name: str
    description: str
    whatsapp: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    products: List[Dict[str, Any]] = []
    enable_lead_capture: bool = True
    custom_prompt: Optional[str] = None

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    fullname: str

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    business_id: int

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    id: int
    tokens: int
    created_at: datetime
    is_verified: bool
    business_id: int
    business: Business

    class Config:
        from_attributes = True

class UserResponse(UserBase):
    id: int
    tokens: int
    created_at: datetime
    is_verified: bool
    business_id: int
    business: Business

    class Config:
        from_attributes = True

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
    requires_verification: Optional[bool] = False

# Password reset schemas
class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)

# Product schemas
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: Optional[float] = None
    image_url: Optional[str] = None
    tags: Optional[str] = None

class ProductCreate(ProductBase):
    business_id: int

class Product(ProductBase):
    id: int
    business_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Lead schemas
class LeadBase(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    message: Optional[str] = None

class LeadCreate(LeadBase):
    user_id: Optional[int] = None
    business_id: Optional[int] = None

class Lead(LeadBase):
    id: int
    user_id: Optional[int] = None
    business_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Chat schemas - CRITICAL FOR YOUR SYSTEM
class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)
    history: Optional[List[Dict[str, str]]] = []
    demo_mode: bool = False

class ChatResponse(BaseModel):
    response: str
    emotion: Optional[str] = "neutral"
    visual_url: Optional[str] = None
    show_contact: bool = False
    contact_whatsapp: Optional[str] = None
    contact_phone: Optional[str] = None
    cleanup_performed: bool = False
    tokens_remaining: Optional[int] = None

class ChatBase(BaseModel):
    message: str
    response: str
    emotion: Optional[str] = None
    sales_stage: Optional[str] = None
    is_sale: bool = False

class ChatCreate(ChatBase):
    user_id: int
    business_id: int

class Chat(ChatBase):
    id: int
    user_id: int
    business_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Token schemas
class TokenTransactionBase(BaseModel):
    amount: int
    type: str  # "message", "sale", "purchase", "lead_capture"
    detail: str

class TokenTransactionCreate(TokenTransactionBase):
    user_id: int

class TokenTransaction(TokenTransactionBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class TokenDeductRequest(BaseModel):
    amount: int = Field(..., gt=0, le=100)

class TokenBalance(BaseModel):
    tokens: int

# Payment schemas
class PaymentCreate(BaseModel):
    amount: int = Field(..., gt=0)
    payment_method: Optional[str] = "stripe"

class StripeSession(BaseModel):
    session_url: str
    session_id: str

class BinanceOrder(BaseModel):
    checkout_url: str
    order_id: str

class PaymentIntentRequest(BaseModel):
    amount: int = Field(..., gt=0)
    currency: str = "usd"

class PaymentIntentResponse(BaseModel):
    client_secret: str
    amount: int

# Analytics schemas for Dashboard
class DashboardStats(BaseModel):
    total_chats: int
    chats_today: int
    total_leads: int
    leads_today: int
    total_sales: int
    conversion_rate: float
    avg_response_time: float
    tokens_used_today: int
    emotion_breakdown: Dict[str, int]
    sales_stage_breakdown: Dict[str, int]
    popular_products: List[Dict[str, Any]]
    daily_stats: List[Dict[str, Any]]

class EmotionStats(BaseModel):
    excited: int = 0
    frustrated: int = 0
    hesitant: int = 0
    curious: int = 0
    confused: int = 0
    buying_interest: int = 0
    neutral: int = 0
    ready_to_buy: int = 0
    price_conscious: int = 0
    comparing: int = 0

class SalesStageStats(BaseModel):
    rapport_building: int = 0
    discovery: int = 0
    product_discussion: int = 0
    objection_handling: int = 0
    consideration: int = 0
    closing: int = 0

class ProductStats(BaseModel):
    product_name: str
    mentions: int
    conversions: int
    conversion_rate: float

class DailyStats(BaseModel):
    date: str
    chats: int
    leads: int
    sales: int
    tokens_used: int
    revenue: float

# Integration schemas
class IntegrationConnect(BaseModel):
    platform: str = Field(..., pattern="^(facebook|instagram|twitter|whatsapp)$")
    access_token: str
    refresh_token: Optional[str] = None

class IntegrationResponse(BaseModel):
    platform: str
    connected: bool
    connected_at: Optional[datetime] = None

# File upload schemas
class FileUploadResponse(BaseModel):
    filename: str
    url: str
    size: int

# Business configuration update
class BusinessConfigUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    whatsapp: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    products: Optional[List[Dict[str, Any]]] = None
    enable_lead_capture: Optional[bool] = None
    custom_prompt: Optional[str] = None

    @validator('whatsapp', 'phone')
    def validate_phone(cls, v):
        if v and not v.startswith('+'):
            raise ValueError('Phone number must start with +')
        return v