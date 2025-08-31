from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from models import User, Lead
from utils.token_logic import get_db, get_current_user
import schemas
from typing import List

router = APIRouter()

@router.get("/", response_model=List[schemas.Lead])
def get_leads(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieves all leads associated with the current user's business.
    """
    leads = db.query(Lead).filter(Lead.business_id == current_user.business_id).order_by(Lead.created_at.desc()).all()
    return leads
