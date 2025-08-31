from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from models import TokenTransaction
from utils.token_logic import get_db, get_current_user, deduct_tokens
from pydantic import BaseModel
from typing import List
from models import User

router = APIRouter()

class DeductRequest(BaseModel):
    amount: int

class TokenTxOut(BaseModel):
    id: int
    amount: int
    type: str
    detail: str
    created_at: str

    class Config:
        orm_mode = True

@router.post("/deduct")
def deduct_tokens_endpoint(
    request: DeductRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        new_balance = deduct_tokens(
            db,
            current_user,
            request.amount,
            tx_type="chat",
            detail="Chat message"
        )
        return {"tokens": new_balance}
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Token deduction failed: {str(e)}"
        )

@router.get("/transactions", response_model=List[TokenTxOut])
def get_token_transactions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    txs = db.query(TokenTransaction).filter(TokenTransaction.user_id == current_user.id).order_by(TokenTransaction.created_at.desc()).all()
    return txs

@router.get("/balance")
def get_token_balance(current_user: User = Depends(get_current_user)):
    return {"tokens": current_user.tokens}
