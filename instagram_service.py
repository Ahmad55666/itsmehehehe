import os
import requests
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from models import User, SocialMediaToken
from utils.database import get_db
from utils.token_logic import get_current_user

router = APIRouter()

INSTAGRAM_APP_ID = os.environ.get('INSTAGRAM_APP_ID')
INSTAGRAM_APP_SECRET = os.environ.get('INSTAGRAM_APP_SECRET')
INSTAGRAM_REDIRECT_URI = os.environ.get('INSTAGRAM_REDIRECT_URI')

@router.get('/connect/instagram')
async def connect_instagram(current_user: User = Depends(get_current_user)):
    """
    Redirects the user to Instagram's OAuth consent page.
    """
    scope = 'user_profile,user_media'
    auth_url = f'https://api.instagram.com/oauth/authorize?client_id={INSTAGRAM_APP_ID}&redirect_uri={INSTAGRAM_REDIRECT_URI}&scope={scope}&response_type=code&state={current_user.id}'
    return RedirectResponse(url=auth_url)

@router.get('/callback/instagram')
async def callback_instagram(code: str = Query(...), state: str = Query(...), db: Session = Depends(get_db)):
    """
    Handles the callback from Instagram's OAuth.
    """
    user_id = int(state)
    if not code:
        raise HTTPException(status_code=400, detail="No code provided")

    # Exchange code for an access token
    token_url = 'https://api.instagram.com/oauth/access_token'
    token_data = {
        'client_id': INSTAGRAM_APP_ID,
        'client_secret': INSTAGRAM_APP_SECRET,
        'grant_type': 'authorization_code',
        'redirect_uri': INSTAGRAM_REDIRECT_URI,
        'code': code
    }
    response = requests.post(token_url, data=token_data)
    data = response.json()
    access_token = data.get('access_token')

    if not access_token:
        raise HTTPException(status_code=400, detail="Could not retrieve access token")

    # Check if a token already exists and update it, or create a new one
    token = db.query(SocialMediaToken).filter_by(user_id=user_id, platform='instagram').first()
    if not token:
        token = SocialMediaToken(user_id=user_id, platform='instagram')

    token.access_token = access_token
    db.add(token)
    db.commit()

    return RedirectResponse(url='/settings/integrations')

@router.post('/disconnect/instagram')
async def disconnect_instagram(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Disconnects the user's Instagram account.
    """
    token = db.query(SocialMediaToken).filter_by(user_id=current_user.id, platform='instagram').first()
    if token:
        db.delete(token)
        db.commit()
    return {'message': 'Instagram account disconnected successfully'}
