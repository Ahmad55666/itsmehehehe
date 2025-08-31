from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy.orm import Session
from models import User, Chat, Lead, Business, Product
from utils.token_logic import get_db, get_current_user, deduct_tokens
from openrouter_api import query_openrouter
from utils.emotion_engine import detect_sales_emotion
from utils.product_matcher import smart_product_match, get_all_products_for_listing, check_general_product_inquiry
from utils.chat_memory_manager import get_chat_memory_with_cleanup, format_memory_for_ai
from utils.lead_capture import save_lead
from business_config import SYSTEM_PROMPT, BUSINESS_PRODUCTS
import schemas
import json
import re
import logging
from pydantic import BaseModel
from typing import List

router = APIRouter()
logger = logging.getLogger(__name__)

class ChatRequest(BaseModel):
    messages: List[dict]

def extract_lead_info(message):
    """Extract lead information from user message"""
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    phone_pattern = r'[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}'
    
    email = re.findall(email_pattern, message)
    phone = re.findall(phone_pattern, message)
    
    # Extract name (simple heuristic - words after "I am" or "My name is")
    name = None
    name_patterns = [
        r"(?:i am|i'm|my name is|this is|call me)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)",
        r"^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+here"
    ]
    
    for pattern in name_patterns:
        match = re.search(pattern, message, re.IGNORECASE)
        if match:
            name = match.group(1)
            break
    
    return {
        "name": name,
        "email": email[0] if email else None,
        "phone": phone[0] if phone else None
    }

def get_business_config(db: Session, business_id: int):
    """Get business configuration with products and settings"""
    business = db.query(Business).filter(Business.id == business_id).first()
    
    if business and business.config:
        try:
            return json.loads(business.config)
        except json.JSONDecodeError:
            pass
    
    # Fallback to default config
    return {
        "name": "Your Business",
        "whatsapp": "+1234567890",
        "phone": "+1234567890",
        "products": BUSINESS_PRODUCTS,
        "description": "We sell quality products",
        "enable_lead_capture": True
    }

def format_system_prompt(config, user_name, emotion_data, tone):
    """Format the system prompt with actual data"""
    prompt = SYSTEM_PROMPT.format(
        business_name=config.get("name", "Business"),
        user_name=user_name or "valued customer",
        emotion_primary=emotion_data.get("primary", "neutral"),
        emotion_all=", ".join(emotion_data.get("all_emotions", [])) or "neutral",
        tone=tone or "neutral",
        business_whatsapp=config.get("whatsapp", ""),
        business_phone=config.get("phone", "")
    )
    
    # Add product context
    products = config.get("products", [])
    if products:
        product_list = "\n".join([
            f"- {p['name']}: {p['description']} (${p.get('price', 'N/A')})"
            for p in products[:5]  # Limit to 5 products in context
        ])
        prompt += f"\n\nAvailable products:\n{product_list}"
    
    return prompt

@router.post("/")
async def chat_endpoint(
    chat_request: ChatRequest,
    request: Request,
    db: Session = Depends(get_db),
    business_id: int = ...,
    current_user=Depends(get_current_user)
):
    """
    Main chat endpoint with emotion detection, product matching, and sales logic
    """
    try:
        # Handle demo mode
        if request.json().get("demo_mode"):
            # In demo mode, use a default business config
            business_config = {
                "name": "DemoShop",
                "whatsapp": "+1234567890", 
                "phone": "+15551234567",
                "products": BUSINESS_PRODUCTS,
                "description": "Your AI-powered sales assistant",
                "enable_lead_capture": False
            }
            business_id = 1  # Default business ID for demo
            user_name = "Friend"
        else:
            # Production mode - get actual business config
            business_id = current_user.business_id
            business_config = get_business_config(db, business_id)
            user_name = current_user.fullname.split()[0] if current_user.fullname else "Friend"
            
            # Deduct tokens for non-demo users
            try:
                deduct_tokens(db, current_user, 5, "chat", f"Chat message: {request.json().get('message')[:50]}")
            except HTTPException as e:
                if e.status_code == 402:
                    raise HTTPException(status_code=402, detail="Insufficient tokens")
                raise

        # 1. EMOTION DETECTION
        emotion_data = detect_sales_emotion(request.json().get("message"))
        logger.info(f"Detected emotion: {emotion_data}")
        
        # 2. PRODUCT MATCHING
        matched_product = None
        visual_url = None
        show_contact = False
        contact_info = None
        
        # Check for general product inquiry
        if check_general_product_inquiry(request.json().get("message")):
            products = get_all_products_for_listing(db, business_id)
            if not products:
                products = business_config.get("products", [])
        else:
            # Try to match specific product
            matched_product = smart_product_match(db, request.json().get("message"), business_id)
            
            if matched_product:
                visual_url = matched_product.get("image_url") or matched_product.get("video_url")
                
                # Show contact info if strong buying intent
                if emotion_data.get("buying_intent_score", 0) > 5 or \
                   emotion_data.get("primary") in ["ready_to_buy", "buying_interest"]:
                    show_contact = True
                    contact_info = {
                        "whatsapp": business_config.get("whatsapp"),
                        "phone": business_config.get("phone")
                    }

        # 3. GET CHAT MEMORY
        memory_entries, cleanup_performed = get_chat_memory_with_cleanup(db, business_id, limit=10)
        memory_context = format_memory_for_ai(memory_entries)
        
        # 4. DETERMINE TONE
        tone = emotion_data.get("tone", "neutral")
        if emotion_data.get("primary") == "frustrated":
            tone = "empathetic"
        elif emotion_data.get("primary") == "excited":
            tone = "enthusiastic"
        elif emotion_data.get("primary") == "confused":
            tone = "patient"
        elif emotion_data.get("primary") == "sarcasm":
            tone = "lighthearted"
        
        # 5. FORMAT SYSTEM PROMPT WITH ACTUAL DATA
        system_prompt = format_system_prompt(
            business_config,
            user_name,
            emotion_data,
            tone
        )
        
        # 6. BUILD CONTEXT FOR AI
        context = ""
        
        # Add memory context
        if memory_context:
            context += memory_context + "\n"
        
        # Add current product context if matched
        if matched_product:
            context += f"\nUser is interested in: {matched_product['name']} - {matched_product['description']} (${matched_product.get('price', 'N/A')})\n"
            if visual_url:
                context += f"Product visual available: {visual_url}\n"
        
        # Add buying intent context
        if emotion_data.get("buying_intent_score", 0) > 5:
            context += "\n[USER SHOWS STRONG BUYING INTENT - Provide contact details and guide to purchase]\n"
        
        # 7. PREPARE MESSAGES FOR AI
        messages = [
            {"role": "system", "content": system_prompt},
        ]
        
        # Add context as assistant message if exists
        if context:
            messages.append({"role": "assistant", "content": f"[Context: {context}]"})
        
        # Add the actual user message
        messages.append({"role": "user", "content": request.json().get("message")})
        
        # 8. QUERY AI WITH CUSTOM PROMPT
        try:
            ai_response = await query_openrouter(messages)
            
            # Post-process AI response to ensure it follows instructions
            if show_contact and contact_info:
                # Ensure contact info is in response if buying intent detected
                if contact_info["whatsapp"] and contact_info["whatsapp"] not in ai_response:
                    ai_response += f"\n\n📱 Order on WhatsApp: {contact_info['whatsapp']}"
                if contact_info["phone"] and contact_info["phone"] not in ai_response:
                    ai_response += f"\n☎️ Call us: {contact_info['phone']}"
            
        except Exception as e:
            logger.error(f"AI query failed: {str(e)}")
            # Fallback response
            ai_response = "I'm here to help you find the perfect product! What are you looking for today?"
            
            if matched_product:
                ai_response = f"Great choice! {matched_product['name']} is {matched_product['description']}. "
                if matched_product.get('price'):
                    ai_response += f"It's available for ${matched_product['price']}. "
                ai_response += "Would you like to know more about it?"

        # 9. SAVE CHAT TO DATABASE
        if not request.json().get("demo_mode"):
            chat_record = Chat(
                user_id=current_user.id,
                business_id=business_id,
                message=request.json().get("message"),
                response=ai_response,
                emotion=emotion_data.get("primary", "neutral"),
                sales_stage=determine_sales_stage(emotion_data, matched_product),
                is_sale=emotion_data.get("primary") == "ready_to_buy"
            )
            db.add(chat_record)
            
            # 10. LEAD CAPTURE
            if business_config.get("enable_lead_capture"):
                lead_info = extract_lead_info(request.json().get("message"))
                if lead_info.get("email") or lead_info.get("phone"):
                    try:
                        save_lead(
                            db, 
                            current_user.id,
                            business_id,
                            lead_info.get("name", "Unknown"),
                            lead_info.get("email", ""),
                            lead_info.get("phone", ""),
                            request.json().get("message"),
                            True
                        )
                    except Exception as e:
                        logger.error(f"Lead capture failed: {str(e)}")
            
            db.commit()

        # 11. PREPARE RESPONSE
        response = schemas.ChatResponse(
            response=ai_response,
            emotion=emotion_data.get("primary", "neutral"),
            visual_url=visual_url,
            show_contact=show_contact,
            contact_whatsapp=contact_info.get("whatsapp") if contact_info else None,
            contact_phone=contact_info.get("phone") if contact_info else None,
            cleanup_performed=cleanup_performed,
            tokens_remaining=current_user.tokens if not request.json().get("demo_mode") else None
        )
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Chat endpoint error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Chat processing failed: {str(e)}")

def determine_sales_stage(emotion_data, matched_product):
    """Determine the current sales stage based on emotion and context"""
    primary = emotion_data.get("primary", "neutral")
    
    if primary == "ready_to_buy":
        return "closing"
    elif primary in ["buying_interest", "strong_interest"]:
        return "consideration"
    elif matched_product:
        return "product_discussion"
    elif primary in ["curious", "excited_interest"]:
        return "discovery"
    elif primary in ["hesitant", "price_conscious", "comparing"]:
        return "objection_handling"
    else:
        return "rapport_building"

@router.get("/history", response_model=list[schemas.Chat])
async def get_chat_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get chat history for the current user's business"""
    chats = db.query(Chat).filter(
        Chat.business_id == current_user.business_id
    ).order_by(Chat.created_at.desc()).limit(50).all()
    
    return chats

@router.delete("/clear")
async def clear_chat_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Clear chat history for the current user's business"""
    db.query(Chat).filter(
        Chat.business_id == current_user.business_id
    ).delete()
    db.commit()
    
    return {"message": "Chat history cleared successfully"}
