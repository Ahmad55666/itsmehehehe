from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models import Product, User
from utils.token_logic import get_db, get_current_user
import schemas
from typing import List

router = APIRouter()

@router.post("/", response_model=schemas.Product)
def create_product(
    product: schemas.ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if product.business_id != current_user.business_id:
        raise HTTPException(status_code=403, detail="Not authorized to create product for this business")
    db_product = Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.get("/", response_model=List[schemas.Product])
def list_products(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    return db.query(Product).filter(Product.business_id == current_user.business_id).all()

@router.put("/{product_id}", response_model=schemas.Product)
def update_product(
    product_id: int,
    product: schemas.ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    if db_product.business_id != current_user.business_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this product")
    
    for key, value in product.dict().items():
        setattr(db_product, key, value)
    
    db.commit()
    db.refresh(db_product)
    return db_product

@router.delete("/{product_id}", response_model=schemas.Product)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    if db_product.business_id != current_user.business_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this product")
    
    db.delete(db_product)
    db.commit()
    return db_product
