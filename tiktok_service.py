import os
import requests
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from models import User, SocialMediaToken
from utils.database import get_db
from utils.token_logic import get_current_user

router = APIRouter()

TIKTOK_APP_ID = os.environ.get('TIKTOK_APP_ID')
TIKTOK_APP_SECRET = os.environ.get('TIKTOK_APP_SECRET')
TIKTOK_REDIRECT_URI = os.environ.get('TIKTOK_REDIRECT_URI')

@router.get('/connect/tiktok')
async def connect_tiktok(current_user: User = Depends(get_current_user)):
    """
    Redirects the user to TikTok's OAuth consent page.
    """
    scope = 'user.info.basic'
    auth_url = f'https://www.tiktok.com/auth/authorize/?client_key={TIKTOK_APP_ID}&scope={scope}&response_type=code&redirect_uri={TIKTOK_REDIRECT_URI}&state={current_user.id}'
    return RedirectResponse(url=auth_url)

@router.get('/callback/tiktok')
async def callback_tiktok(code: str = Query(...), state: str = Query(...), db: Session = Depends(get_db)):
    """
    Handles the callback from TikTok's OAuth.
    """
    user_id = int(state)
    if not code:
        raise HTTPException(status_code=400, detail="No code provided")

    # Exchange code for an access token
    token_url = 'https://open-api.tiktok.com/oauth/access_token/'
    token_data = {
        'client_key': TIKTOK_APP_ID,
        'client_secret': TIKTOK_APP_SECRET,
        'grant_type': 'authorization_code',
        'redirect_uri': TIKTOK_REDIRECT_URI,
        'code': code
    }
    response = requests.post(token_url, data=token_data)
    data = response.json()
    access_token = data.get('access_token')

    if not access_token:
        raise HTTPException(status_code=400, detail="Could not retrieve access token")

    # Check if a token already exists and update it, or create a new one
    token = db.query(SocialMediaToken).filter_by(user_id=user_id, platform='tiktok').first()
    if not token:
        token = SocialMediaToken(user_id=user_id, platform='tiktok')

    token.access_token = access_token
    token.refresh_token = data.get('refresh_token')
    token.expires_in = data.get('expires_in')
    db.add(token)
    db.commit()

    return RedirectResponse(url='/settings/integrations')

@router.post('/disconnect/tiktok')
async def disconnect_tiktok(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Disconnects the user's TikTok account.
    """
    token = db.query(SocialMediaToken).filter_by(user_id=current_user.id, platform='tiktok').first()
    if token:
        db.delete(token)
        db.commit()
    return {'message': 'TikTok account disconnected successfully'}
