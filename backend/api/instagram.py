"""
Instagram posting endpoint.
POST /api/post-instagram → posts campaign to Instagram
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from services.instagram_poster import post_to_instagram
from services.supabase_client import supabase_client
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["instagram"])


class PostInstagramRequest(BaseModel):
    campaign_id: str
    user_id: str
    image_url: str
    caption: str


class PostInstagramResponse(BaseModel):
    success: bool
    message: str
    instagram_post_url: Optional[str] = None


@router.post("/post-instagram", response_model=PostInstagramResponse)
async def post_instagram(request: PostInstagramRequest) -> PostInstagramResponse:
    """
    Post campaign to Instagram.
    
    Flow:
    1. Fetch instagram_connections from Supabase for this user
    2. Get access_token and instagram_id
    3. Call post_to_instagram() service
    4. Update campaigns table with posted_to_instagram=true, posted_at=NOW()
    5. Return success/failure
    """
    
    try:
        # Step 1: Fetch Instagram connection
        connection_response = supabase_client.table("instagram_connections") \
            .select("*") \
            .eq("user_id", request.user_id) \
            .single() \
            .execute()
        
        connection = connection_response.data
        if not connection:
            raise HTTPException(
                status_code=404,
                detail="Instagram not connected. User needs to connect Instagram first."
            )
        
        access_token = connection.get("access_token")
        instagram_id = connection.get("instagram_id")
        
        if not access_token or not instagram_id:
            raise HTTPException(
                status_code=400,
                detail="Instagram connection incomplete. Please reconnect."
            )
        
        # Step 2: Call posting service
        result = await post_to_instagram(
            image_url=request.image_url,
            caption=request.caption,
            access_token=access_token,
            ig_user_id=instagram_id
        )
        
        if not result.get("success"):
            # Log but don't crash — show error to frontend
            logger.error(f"Instagram posting failed: {result.get('message')}")
            return PostInstagramResponse(
                success=False,
                message=f"Failed to post: {result.get('message')}"
            )
        
        # Step 3: Update campaigns table
        supabase_client.table("campaigns") \
            .update({
                "posted_to_instagram": True,
                "posted_at": "now()"  # Supabase NOW()
            }) \
            .eq("id", request.campaign_id) \
            .execute()
        
        # Step 4: Return success
        return PostInstagramResponse(
            success=True,
            message="Posted to Instagram successfully",
            instagram_post_url=result.get("instagram_post_url")
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error posting to Instagram: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Server error: {str(e)}"
        )