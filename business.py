from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models import Business, User
from utils.token_logic import get_db, get_current_user
import schemas
from typing import List

router = APIRouter()

@router.post("/", response_model=schemas.Business)
def create_business(
    business: schemas.BusinessCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_business = Business(name=business.name, config=business.config)
    db.add(db_business)
    db.commit()
    db.refresh(db_business)
    
    # Link the business to the user who created it
    current_user.business_id = db_business.id
    db.commit()
    
    return db_business

@router.get("/{business_id}", response_model=schemas.Business)
def get_business(
    business_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_business = db.query(Business).filter(Business.id == business_id).first()
    if not db_business:
        raise HTTPException(status_code=404, detail="Business not found")
    if db_business.id != current_user.business_id:
        raise HTTPException(status_code=403, detail="Not authorized to view this business")
    return db_business

@router.put("/{business_id}", response_model=schemas.Business)
def update_business(
    business_id: int,
    business: schemas.BusinessCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_business = db.query(Business).filter(Business.id == business_id).first()
    if not db_business:
        raise HTTPException(status_code=404, detail="Business not found")
    if db_business.id != current_user.business_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this business")
    
    db_business.name = business.name
    db_business.config = business.config
    
    db.commit()
    db.refresh(db_business)
    return db_business

@router.get("/config", response_model=schemas.BusinessConfig)
def get_business_config(current_user: User = Depends(get_current_user)):
    if not current_user.business:
        raise HTTPException(status_code=404, detail="Business not found for this user")
    return current_user.business.config
