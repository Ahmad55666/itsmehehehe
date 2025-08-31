import os
import requests
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from models import User, SocialMediaToken
from utils.database import get_db
from utils.token_logic import get_current_user

router = APIRouter()

FB_APP_ID = os.environ.get('FACEBOOK_APP_ID')
FB_APP_SECRET = os.environ.get('FACEBOOK_APP_SECRET')
FB_REDIRECT_URI = os.environ.get('FACEBOOK_REDIRECT_URI')

@router.get('/connect/facebook')
async def connect_facebook(current_user: User = Depends(get_current_user)):
    """
    Redirects the user to Facebook's OAuth consent page.
    """
    scope = 'email,public_profile'
    auth_url = f'https://www.facebook.com/v12.0/dialog/oauth?client_id={FB_APP_ID}&redirect_uri={FB_REDIRECT_URI}&scope={scope}&state={current_user.id}'
    return RedirectResponse(url=auth_url)

@router.get('/callback/facebook')
async def callback_facebook(code: str = Query(...), state: str = Query(...), db: Session = Depends(get_db)):
    """
    Handles the callback from Facebook's OAuth.
    """
    user_id = int(state)
    if not code:
        raise HTTPException(status_code=400, detail="No code provided")

    # Exchange code for an access token
    token_url = f'https://graph.facebook.com/v12.0/oauth/access_token?client_id={FB_APP_ID}&redirect_uri={FB_REDIRECT_URI}&client_secret={FB_APP_SECRET}&code={code}'
    response = requests.get(token_url)
    data = response.json()
    access_token = data.get('access_token')

    if not access_token:
        raise HTTPException(status_code=400, detail="Could not retrieve access token")

    # Check if a token already exists and update it, or create a new one
    token = db.query(SocialMediaToken).filter_by(user_id=user_id, platform='facebook').first()
    if not token:
        token = SocialMediaToken(user_id=user_id, platform='facebook')
    
    token.access_token = access_token
    db.add(token)
    db.commit()

    return RedirectResponse(url='/settings/integrations') # Redirect to frontend settings page

@router.post('/disconnect/facebook')
async def disconnect_facebook(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Disconnects the user's Facebook account.
    """
    token = db.query(SocialMediaToken).filter_by(user_id=current_user.id, platform='facebook').first()
    if token:
        db.delete(token)
        db.commit()
    return {'message': 'Facebook account disconnected successfully'}
