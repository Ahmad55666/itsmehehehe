from sqlalchemy.orm import Session
from models import Chat
import sys
from fastapi import HTTPException
import logging
from .auth import get_current_user

MAX_MEMORY_SIZE_MB = 15
BYTES_PER_MB = 1024 * 1024

def get_memory_size_bytes(text):
    """Calculate memory size of text in bytes"""
    return sys.getsizeof(text)

def get_chat_memory_with_cleanup(
    db: Session, 
    business_id: int, 
    current_user,
    limit: int = 20
):
    """
    Get chat memory with automatic cleanup if too large
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")

    # Get recent chats
    recent_chats = db.query(Chat).filter(
        Chat.business_id == business_id
    ).order_by(Chat.created_at.desc()).limit(limit * 2).all()  # Get more to check size
    
    if not recent_chats:
        return [], False
    
    # Calculate total memory size
    total_size = 0
    memory_entries = []
    
    for chat in reversed(recent_chats):  # Reverse to chronological order
        chat_size = get_memory_size_bytes(chat.message) + get_memory_size_bytes(chat.response or "")
        total_size += chat_size
        
        memory_entries.append(f"Customer: {chat.message}")
        if chat.response:
            memory_entries.append(f"You: {chat.response}")
    
    # Check if cleanup needed
    size_mb = total_size / BYTES_PER_MB
    cleanup_performed = False
    
    if size_mb > MAX_MEMORY_SIZE_MB:
        # Clear old chats, keep only recent ones
        old_chats = db.query(Chat).filter(
            Chat.business_id == business_id
        ).order_by(Chat.created_at.desc()).offset(10).all()  # Keep last 10 chats
        
        for old_chat in old_chats:
            db.delete(old_chat)
        
        db.commit()
        cleanup_performed = True
        
        # Get fresh memory after cleanup
        recent_chats = db.query(Chat).filter(
            Chat.business_id == business_id
        ).order_by(Chat.created_at.desc()).limit(10).all()
        
        memory_entries = []
        for chat in reversed(recent_chats):
            memory_entries.append(f"Customer: {chat.message}")
            if chat.response:
                memory_entries.append(f"You: {chat.response}")
    
    # Return last 20 exchanges max for context
    return memory_entries[-20:], cleanup_performed

def format_memory_for_ai(
    memory_entries, 
    current_user
):
    """Format memory entries for AI context with authentication"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
            
    if not memory_entries:
        return ""
    
    formatted_entries = []
    for entry in memory_entries:
        if isinstance(entry, dict):
            sender = "Customer" if entry.get("sender") == "user" else "You"
            formatted_entries.append(f"{sender}: {entry.get('text', '')}")
        else:
            formatted_entries.append(str(entry))
            
    return "Previous conversation:\n" + "\n".join(formatted_entries) + "\n\n"

def should_notify_cleanup(cleanup_performed):
    """Check if user should be notified about cleanup"""
    return cleanup_performed
    
    formatted_entries = []
    for entry in memory_entries:
        if isinstance(entry, dict):
            sender = "Customer" if entry.get("sender") == "user" else "You"
            formatted_entries.append(f"{sender}: {entry.get('text', '')}")
        else:
            formatted_entries.append(str(entry))
            
    return "Previous conversation:\n" + "\n".join(formatted_entries) + "\n\n"

def should_notify_cleanup(cleanup_performed):
    """Check if user should be notified about cleanup"""
    return cleanup_performed
