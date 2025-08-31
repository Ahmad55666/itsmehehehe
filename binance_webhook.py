from fastapi import APIRouter, Request, HTTPException, Depends
from sqlalchemy.orm import Session
from models import User, TokenTransaction
from utils.token_logic import get_db
from config import settings
import json

router = APIRouter()

@router.post("/binance")
async def binance_webhook(request: Request, db: Session = Depends(get_db)):
    try:
        payload = await request.json()
        
        # IMPORTANT: You should implement a signature verification mechanism
        # to ensure the webhook is from Binance. This is a critical security step.
        # For now, we will trust the payload for demonstration purposes.

        if payload.get("bizStatus") == "PAY_SUCCESS":
            merchant_trade_no = payload["data"]["merchantTradeNo"]
            user_id_str = merchant_trade_no.split('-')[0]
            user_id = int(user_id_str)
            
            # This is a simplified calculation. You should store the order amount
            # in your database when creating the order and use that to determine
            # the number of tokens to grant.
            amount_paid = float(payload["data"]["orderAmount"])
            tokens_bought = int(amount_paid * 100) # Example: $1 = 100 tokens

            user = db.query(User).filter(User.id == user_id).first()
            if user:
                user.tokens += tokens_bought
                tx = TokenTransaction(
                    user_id=user.id, 
                    amount=tokens_bought, 
                    type="purchase", 
                    detail="Binance Pay"
                )
                db.add(tx)
                db.commit()

        return {"returnCode": "SUCCESS"}
    except Exception as e:
        # Binance expects a specific response format on failure
        return {"returnCode": "FAIL", "returnMessage": str(e)}
