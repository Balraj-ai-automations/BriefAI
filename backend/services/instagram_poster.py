"""
Direct Instagram Graph API integration.
No middleware. No n8n. Just httpx + async.

Posts image + caption to Instagram in 2 steps:
  1. POST /media (create container)
  2. Wait 5 seconds (Meta requirement)
  3. POST /media_publish (publish the container)
"""

import httpx
import asyncio
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

GRAPH_API_VERSION = "v18.0"
GRAPH_URL = f"https://graph.instagram.com/{GRAPH_API_VERSION}"


async def post_to_instagram(
    image_url: str,
    caption: str,
    access_token: str,
    ig_user_id: str
) -> Dict[str, Any]:
    """
    Post image + caption to Instagram.
    
    Args:
        image_url: URL of image (from Supabase Storage)
        caption: Instagram caption (with hashtags)
        access_token: Long-lived Instagram access token (60 days)
        ig_user_id: Instagram user ID
    
    Returns:
        {
            "success": bool,
            "message": str,
            "instagram_post_url": str (if success)
        }
    """
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            
            # Step 1: Create media container
            logger.info(f"Creating Instagram media container for user {ig_user_id}")
            
            container_response = await client.post(
                f"{GRAPH_URL}/{ig_user_id}/media",
                params={
                    "image_url": image_url,
                    "caption": caption,
                    "access_token": access_token,
                }
            )
            
            if container_response.status_code not in [200, 201]:
                error_msg = container_response.text
                logger.error(f"Container creation failed: {error_msg}")
                return {
                    "success": False,
                    "message": f"Failed to create container: {error_msg}"
                }
            
            container_data = container_response.json()
            
            # Check for errors in response (Meta returns 200 even with errors sometimes)
            if "error" in container_data:
                error_msg = container_data["error"].get("message", "Unknown error")
                logger.error(f"Instagram API error: {error_msg}")
                return {
                    "success": False,
                    "message": f"Instagram error: {error_msg}"
                }
            
            container_id = container_data.get("id")
            if not container_id:
                logger.error("No container ID in response")
                return {
                    "success": False,
                    "message": "No container ID returned by Instagram"
                }
            
            logger.info(f"Container created: {container_id}")
            
            # Step 2: Wait (Meta requirement — media must be processed first)
            logger.info("Waiting 5 seconds for media processing...")
            await asyncio.sleep(5)
            
            # Step 3: Publish the container
            logger.info(f"Publishing media {container_id}")
            
            publish_response = await client.post(
                f"{GRAPH_URL}/{ig_user_id}/media_publish",
                params={
                    "creation_id": container_id,
                    "access_token": access_token,
                }
            )
            
            if publish_response.status_code not in [200, 201]:
                error_msg = publish_response.text
                logger.error(f"Publishing failed: {error_msg}")
                return {
                    "success": False,
                    "message": f"Failed to publish: {error_msg}"
                }
            
            publish_data = publish_response.json()
            
            # Check for errors in response
            if "error" in publish_data:
                error_msg = publish_data["error"].get("message", "Unknown error")
                logger.error(f"Instagram publish error: {error_msg}")
                return {
                    "success": False,
                    "message": f"Instagram error: {error_msg}"
                }
            
            media_id = publish_data.get("id")
            if not media_id:
                logger.error("No media ID in publish response")
                return {
                    "success": False,
                    "message": "No media ID returned after publishing"
                }
            
            logger.info(f"Successfully posted to Instagram: {media_id}")
            
            # Build Instagram post URL
            instagram_post_url = f"https://www.instagram.com/p/{media_id}/"
            
            return {
                "success": True,
                "message": "Posted to Instagram successfully",
                "instagram_post_url": instagram_post_url
            }
    
    except asyncio.TimeoutError:
        logger.error("Instagram API request timed out")
        return {
            "success": False,
            "message": "Instagram API request timed out. Please try again."
        }
    except Exception as e:
        logger.exception(f"Unexpected error posting to Instagram: {str(e)}")
        return {
            "success": False,
            "message": f"Unexpected error: {str(e)}"
        }