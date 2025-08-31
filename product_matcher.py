from models import Product, Business
from sqlalchemy.orm import Session
import json
import re

def smart_product_match(db: Session, user_message: str, business_id: int):
    """
    Intelligent product matching that works with business settings only.
    No fallbacks to demo data, no generic products.
    """
    msg = user_message.lower().strip()
    
    # Get products from database first
    db_products = db.query(Product).filter(Product.business_id == business_id).all()
    
    all_products = []
    
    # Add DB products
    for p in db_products:
        all_products.append({
            "name": p.name,
            "description": p.description or "",
            "price": p.price,
            "image_url": p.image_url or "",
            "tags": p.tags or "",
            "source": "database"
        })
    
    # If no DB products, try business config
    if not all_products:
        business = db.query(Business).filter(Business.id == business_id).first()
        if business and business.config:
            try:
                config = json.loads(business.config)
                config_products = config.get("products", [])
                for p in config_products:
                    if p.get("name"):  # Only valid products
                        all_products.append({
                            "name": p.get("name", ""),
                            "description": p.get("description", ""),
                            "price": p.get("price", 0),
                            "image_url": p.get("image_url", ""),
                            "video_url": p.get("video_url", ""),
                            "tags": p.get("tags", ""),
                            "url": p.get("url", ""),
                            "source": "config"
                        })
            except json.JSONDecodeError:
                pass
    
    if not all_products:
        return None  # No products configured
    
    # Simple but effective matching
    best_match = None
    best_score = 0
    
    for product in all_products:
        score = 0
        name = product["name"].lower()
        desc = product["description"].lower()
        tags = product["tags"].lower()
        
        # Exact name match gets highest score
        if name in msg:
            score += 20
        
        # Check if any word from product name is in message
        name_words = name.split()
        for word in name_words:
            if len(word) > 2 and word in msg:
                score += 10
        
        # Check description words
        desc_words = desc.split()
        for word in desc_words:
            if len(word) > 3 and word in msg:
                score += 5
        
        # Check tags
        if tags:
            tag_list = [t.strip() for t in tags.split(",")]
            for tag in tag_list:
                if tag and tag in msg:
                    score += 8
        
        # Buying intent boost
        buying_words = ["buy", "purchase", "get", "want", "need", "order", "looking for"]
        for word in buying_words:
            if word in msg:
                score += 3
                break
        
        if score > best_score and score >= 5:  # Minimum threshold
            best_score = score
            best_match = product
    
    return best_match

def get_all_products_for_listing(db: Session, business_id: int):
    """
    Get all products formatted for 'what do you sell' responses
    """
    # Try database first
    db_products = db.query(Product).filter(Product.business_id == business_id).all()
    
    if db_products:
        return [{
            "name": p.name,
            "description": p.description or "",
            "price": p.price or 0,
            "image_url": p.image_url or "",
        } for p in db_products if p.name]
    
    # Fallback to config
    business = db.query(Business).filter(Business.id == business_id).first()
    if business and business.config:
        try:
            config = json.loads(business.config)
            products = config.get("products", [])
            return [p for p in products if p.get("name")]
        except json.JSONDecodeError:
            pass
    
    return []

def check_general_product_inquiry(message):
    """
    Check if user is asking about products in general
    """
    msg = message.lower()
    general_queries = [
        "what do you sell", "what products", "what do you have", 
        "show me products", "what's available", "your products",
        "what can i buy", "what items", "catalog", "menu"
    ]
    
    return any(query in msg for query in general_queries)