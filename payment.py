from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models import User
from utils.token_logic import get_db, get_current_user
from config import settings
import stripe
import schemas
import requests
import json
import time
import hashlib
import hmac
import uuid

router = APIRouter()
stripe.api_key = settings.STRIPE_SECRET_KEY

# --- Helper function for Binance Pay ---
def hmac_sha512(key, data):
    return hmac.new(key.encode('utf-8'), data.encode('utf-8'), hashlib.sha512).hexdigest().upper()

@router.post("/create-checkout-session", response_model=schemas.StripeSession)
def create_checkout_session(
    payment_data: schemas.PaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[
                {
                    "price_data": {
                        "currency": "usd",
                        "product_data": {
                            "name": "SaaS Chatbot Tokens",
                        },
                        "unit_amount": payment_data.amount * 100,  # Amount in cents
                    },
                    "quantity": 1,
                }
            ],
            mode="payment",
            success_url=f"{settings.FRONTEND_URL}/payment/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{settings.FRONTEND_URL}/payment",
            client_reference_id=str(current_user.id),
        )
        return {"session_url": session.url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/create-binance-order", response_model=schemas.BinanceOrder)
def create_binance_order(
    payment_data: schemas.PaymentCreate,
    current_user: User = Depends(get_current_user),
):
    # --- IMPORTANT ---
    # To make this work, you must add your Binance API keys to your environment variables.
    # For example, in a .env file:
    # BINANCE_API_KEY="YOUR_API_KEY"
    # BINANCE_SECRET_KEY="YOUR_SECRET_KEY"
    
    binance_api_key = getattr(settings, 'BINANCE_API_KEY', None)
    binance_secret_key = getattr(settings, 'BINANCE_SECRET_KEY', None)

    if not binance_api_key or not binance_secret_key:
        raise HTTPException(
            status_code=500, 
            detail="Binance API keys are not configured on the server."
        )

    base_url = "https://bpay.binanceapi.com"
    path = "/binancepay/openapi/v2/order"
    url = f"{base_url}{path}"

    nonce = str(uuid.uuid4())
    timestamp = int(time.time() * 1000)
    
    payload = {
        "env": {"terminalType": "WEB"},
        "merchantTradeNo": f"{current_user.id}-{int(time.time())}",
        "orderAmount": float(payment_data.amount),
        "currency": "USDT", # You can change this to BUSD, etc.
        "goods": {
            "goodsType": "01", # Virtual Goods
            "goodsCategory": "D000", # Other
            "referenceGoodsId": "tokens",
            "goodsName": "SaaS Chatbot Tokens",
        },
        "returnUrl": f"{settings.FRONTEND_URL}/payment/success",
        "cancelUrl": f"{settings.FRONTEND_URL}/payment",
        "webhookUrl": f"{settings.API_URL}/webhook/binance" # You'll need to create this webhook
    }
    
    body = json.dumps(payload)
    string_to_sign = f"{timestamp}\n{nonce}\n{body}\n"
    
    signature = hmac_sha512(binance_secret_key, string_to_sign)

    headers = {
        "Content-Type": "application/json",
        "BinancePay-Timestamp": str(timestamp),
        "BinancePay-Nonce": nonce,
        "BinancePay-Certificate-SN": binance_api_key,
        "BinancePay-Signature": signature,
    }

    try:
        response = requests.post(url, headers=headers, data=body)
        response.raise_for_status()
        data = response.json()

        if data.get("status") == "SUCCESS":
            return {"checkout_url": data["data"]["checkoutUrl"]}
        else:
            raise HTTPException(status_code=500, detail=f"Binance Pay error: {data.get('errorMessage')}")

    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Failed to connect to Binance Pay: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")
