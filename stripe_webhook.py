from fastapi import APIRouter, Request, HTTPException , Depends
from config import settings
from models import User, TokenTransaction
from utils.token_logic import get_db
import stripe

router = APIRouter()
stripe.api_key = settings.STRIPE_SECRET_KEY

@router.post("/stripe")
async def stripe_webhook(request: Request, db=Depends(get_db)):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Stripe webhook error: {str(e)}")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        user_id = session.get("client_reference_id")
        tokens_bought = int(session["amount_total"] // 6) * 100 if session["amount_total"] else 0
        if user_id and tokens_bought:
            user = db.query(User).filter(User.id == int(user_id)).first()
            if user:
                user.tokens += tokens_bought
                tx = TokenTransaction(user_id=user.id, amount=tokens_bought, type="purchase", detail="Stripe")
                db.add(tx)
                db.commit()
    return {"status": "success"}