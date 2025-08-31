import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, chat, product, token, stripe_webhook, business, payment, binance_webhook, leads, upload, integrations
from config import settings
from utils.database import engine, Base, init_db
import models  # Force model registration

app = FastAPI(redirect_slashes=False)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create database tables on startup
    init_db()
    yield
    # Clean up resources if needed

app = FastAPI(title="SaaS Chatbot Platform", version="1.0", lifespan=lifespan)



# Enhanced CORS configuration
origins = [
    "http://localhost:3000",
    "https://your-frontend-domain.com",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"\n{'='*50}")
    print(f"Request: {request.method} {request.url}")
    print(f"Headers: {dict(request.headers)}")
    
    response = await call_next(request)
    
    print(f"Response: {response.status_code}")
    print(f"{'='*50}\n")
    return response

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(product.router, prefix="/api/product", tags=["Product"])
app.include_router(token.router, prefix="/api/token", tags=["Token"])
app.include_router(stripe_webhook.router, prefix="/api/webhook", tags=["StripeWebhook"])
app.include_router(business.router, prefix="/api/business", tags=["Business"])
app.include_router(payment.router, prefix="/api/payment", tags=["Payment"])
app.include_router(binance_webhook.router, prefix="/api/webhook", tags=["BinanceWebhook"])
app.include_router(leads.router, prefix="/api/leads", tags=["Leads"])
app.include_router(upload.router, prefix="/api/upload", tags=["Upload"])
app.include_router(integrations.router, prefix="/api/integrations", tags=["Integrations"])

# Mount the static directory to serve uploaded files
app.mount("/static", StaticFiles(directory="static"), name="static")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
