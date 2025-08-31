from models import Lead, User, TokenTransaction
from sqlalchemy.orm import Session

LEAD_CAPTURE_COST = 15 # Cost in tokens to save one lead

def save_lead(db: Session, user_id: int, business_id: int, name: str, email: str, phone: str, message: str, lead_capture_enabled: bool):
    """
    Saves a new lead to the database and deducts tokens from the user.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        # This should ideally not happen if the user is authenticated
        raise ValueError("User not found.")

    if not lead_capture_enabled:
        return None # Do not save lead if the feature is disabled

    if user.tokens < LEAD_CAPTURE_COST:
        # In a real application, you might want to notify the user
        # or prevent the lead from being saved if they have insufficient tokens.
        # For now, we'll just raise an error.
        raise ValueError("Insufficient tokens to capture lead.")

    # 1. Deduct tokens from the user
    user.tokens -= LEAD_CAPTURE_COST

    # 2. Create a token transaction record
    transaction = TokenTransaction(
        user_id=user.id,
        amount=-LEAD_CAPTURE_COST,
        type="lead_capture",
        detail=f"Captured lead: {name}"
    )
    db.add(transaction)

    # 3. Create and save the new lead
    lead = Lead(
        user_id=user_id,
        business_id=business_id,
        name=name,
        email=email,
        phone=phone,
        message=message
    )
    db.add(lead)
    
    # 4. Commit all changes to the database
    db.commit()
    db.refresh(lead)
    
    return lead
