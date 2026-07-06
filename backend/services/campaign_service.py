"""
Campaign service for saving and retrieving campaigns
from Supabase.
"""

import logging
from uuid import uuid4

from services.supabase_client import supabase

logger = logging.getLogger(__name__)


def save_campaign(state: dict, user_id: str) -> str:
    """
    Save a generated campaign to Supabase.

    Args:
        state: Final LangGraph state.
        user_id: User identifier.

    Returns:
        Campaign ID.
    """

    campaign_id = str(uuid4())

    data = {
        "id": campaign_id,
        "user_id": user_id,
        "product": state["business_profile"].get("product"),
        "usp": state["business_profile"].get("usp"),
        "price": state["business_profile"].get("price"),
        "offer": state["business_profile"].get("offer"),
        "goal": state["business_profile"].get("goal"),
        "occasion": state["business_profile"].get("occasion"),
        "buyer": state["business_profile"].get("buyer"),
        "location": state["business_profile"].get("location"),
        "app_language": state.get("app_language"),
        "ig_language": state.get("ig_language"),
        "wa_language": state.get("wa_language"),
        "whatsapp_copy": state.get("whatsapp_copy"),
        "instagram_caption": state.get("instagram_caption"),
        "image_url": state.get("image_url"),
        "image_prompt": state.get("image_prompt"),
    }

    try:
        supabase.table("campaigns").insert(data).execute()

        logger.info(
            "Campaign %s saved successfully.",
            campaign_id,
        )

        return campaign_id

    except Exception:
        logger.exception(
            "Failed to save campaign."
        )
        raise
    
def get_campaigns(user_id: str) -> list:
    """
    Fetch all campaigns for a user.

    Args:
        user_id: User identifier.

    Returns:
        List of campaigns ordered by newest first.
    """

    try:
        response = (
            supabase.table("campaigns")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )

        return response.data or []

    except Exception:
        logger.exception(
            "Failed to fetch campaigns."
        )
        raise