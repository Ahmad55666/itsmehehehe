import os
import requests
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from models import User, SocialMediaToken
from utils.database import get_db
from utils.token_logic import get_current_user

router = APIRouter()

WHATSAPP_APP_ID = os.environ.get('WHATSAPP_APP_ID')
WHATSAPP_APP_SECRET = os.environ.get('WHATSAPP_APP_SECRET')
WHATSAPP_REDIRECT_URI = os.environ.get('WHATSAPP_REDIRECT_URI')

@router.get('/connect/whatsapp')
async def connect_whatsapp(current_user: User = Depends(get_current_user)):
    """
    Redirects the user to WhatsApp's OAuth consent page.
    """
    # WhatsApp uses a different flow, usually involving Facebook's Business Manager
    # This is a simplified placeholder
    auth_url = f'https://www.facebook.com/v12.0/dialog/oauth?client_id={WHATSAPP_APP_ID}&redirect_uri={WHATSAPP_REDIRECT_URI}&scope=whatsapp_business_management&state={current_user.id}'
    return RedirectResponse(url=auth_url)

@router.get('/callback/whatsapp')
async def callback_whatsapp(code: str = Query(...), state: str = Query(...), db: Session = Depends(get_db)):
    """
    Handles the callback from WhatsApp's OAuth.
    """
    user_id = int(state)
    if not code:
        raise HTTPException(status_code=400, detail="No code provided")

    # Exchange code for an access token
    token_url = f'https://graph.facebook.com/v12.0/oauth/access_token?client_id={WHATSAPP_APP_ID}&redirect_uri={WHATSAPP_REDIRECT_URI}&client_secret={WHATSAPP_APP_SECRET}&code={code}'
    response = requests.get(token_url)
    data = response.json()
    access_token = data.get('access_token')

    if not access_token:
        raise HTTPException(status_code=400, detail="Could not retrieve access token")

    # Check if a token already exists and update it, or create a new one
    token = db.query(SocialMediaToken).filter_by(user_id=user_id, platform='whatsapp').first()
    if not token:
        token = SocialMediaToken(user_id=user_id, platform='whatsapp')

    token.access_token = access_token
    db.add(token)
    db.commit()

    return RedirectResponse(url='/settings/integrations')

@router.post('/disconnect/whatsapp')
async def disconnect_whatsapp(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Disconnects the user's WhatsApp account.
    """
    token = db.query(SocialMediaToken).filter_by(user_id=current_user.id, platform='whatsapp').first()
    if token:
        db.delete(token)
        db.commit()
    return {'message': 'WhatsApp account disconnected successfully'}
