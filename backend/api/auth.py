"""
Instagram OAuth flow.
Two endpoints:
  1. GET /api/auth/instagram/login → redirects to Instagram
  2. GET /api/auth/instagram/callback → handles Instagram's redirect
"""

import os
import json
import httpx
from urllib.parse import urlencode
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import RedirectResponse
from services.supabase_client import supabase_client

router = APIRouter(prefix="/api/auth", tags=["instagram"])

META_APP_ID = os.getenv("META_APP_ID")
META_APP_SECRET = os.getenv("META_APP_SECRET")
META_REDIRECT_URI = os.getenv("META_REDIRECT_URI")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# OAuth endpoints
INSTAGRAM_AUTH_URL = "https://api.instagram.com/oauth/authorize"
INSTAGRAM_TOKEN_URL = "https://graph.instagram.com/v18.0/oauth/access_token"
INSTAGRAM_ME_URL = "https://graph.instagram.com/me?fields=id,username"


@router.get("/instagram/login")
async def instagram_login(user_id: str):
    """
    Start Instagram OAuth flow.
    Frontend calls: /api/auth/instagram/login?user_id=UUID
    """
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id required")
    
    # state parameter encodes user_id for callback
    state = user_id
    
    # Build authorization URL
    auth_params = {
        "client_id": META_APP_ID,
        "redirect_uri": META_REDIRECT_URI,
        "scope": "instagram_business_basic,instagram_business_content_publish",
        "response_type": "code",
        "state": state,
    }
    
    auth_url = f"{INSTAGRAM_AUTH_URL}?{urlencode(auth_params)}"
    return RedirectResponse(url=auth_url)


@router.get("/instagram/callback")
async def instagram_callback(code: str = Query(None), state: str = Query(None), error: str = Query(None)):
    """
    Instagram redirects back here after user authorizes.
    state = user_id (from /login request)
    code = authorization code to exchange for access_token
    """
    
    if error:
        raise HTTPException(status_code=400, detail=f"Instagram error: {error}")
    
    if not code or not state:
        raise HTTPException(status_code=400, detail="Missing code or state")
    
    user_id = state  # Extract user_id from state
    
    try:
        # Step 1: Exchange code for short-lived token
        async with httpx.AsyncClient(timeout=10.0) as client:
            token_response = await client.post(
                INSTAGRAM_TOKEN_URL,
                data={
                    "client_id": META_APP_ID,
                    "client_secret": META_APP_SECRET,
                    "grant_type": "authorization_code",
                    "redirect_uri": META_REDIRECT_URI,
                    "code": code,
                }
            )
            
            if token_response.status_code != 200:
                raise Exception(f"Token exchange failed: {token_response.text}")
            
            token_data = token_response.json()
            short_lived_token = token_data.get("access_token")
            user_id_from_meta = token_data.get("user_id")
            
            # Step 2: Exchange short-lived token for long-lived token (60 days)
            long_token_response = await client.get(
                f"https://graph.instagram.com/access_token",
                params={
                    "grant_type": "ig_exchange_token",
                    "client_secret": META_APP_SECRET,
                    "access_token": short_lived_token,
                }
            )
            
            if long_token_response.status_code != 200:
                raise Exception(f"Long-lived token failed: {long_token_response.text}")
            
            long_token_data = long_token_response.json()
            long_lived_token = long_token_data.get("access_token")
            
            # Step 3: Get Instagram handle
            me_response = await client.get(
                INSTAGRAM_ME_URL,
                params={"access_token": long_lived_token}
            )
            
            if me_response.status_code != 200:
                raise Exception(f"Failed to get user info: {me_response.text}")
            
            me_data = me_response.json()
            instagram_handle = me_data.get("username")
            instagram_id = me_data.get("id")
        
        # Step 4: Save token to Supabase instagram_connections table
        supabase_client.table("instagram_connections").upsert({
            "user_id": user_id,
            "instagram_id": instagram_id,
            "instagram_handle": instagram_handle,
            "access_token": long_lived_token,
            "token_type": "long_lived",  # for tracking
        }).execute()
        
        # Redirect back to frontend with success
        return RedirectResponse(
            url=f"{FRONTEND_URL}/dashboard?instagram_connected=true&handle={instagram_handle}"
        )
    
    except Exception as e:
        # Redirect back to frontend with error
        error_msg = str(e)
        return RedirectResponse(
            url=f"{FRONTEND_URL}/settings?instagram_error={error_msg}"
        )