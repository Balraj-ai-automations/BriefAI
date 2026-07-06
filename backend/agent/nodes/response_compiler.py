"""
Response Compiler Node

Compiles the final API response and saves the campaign
to Supabase.
"""

import logging

from services.campaign_service import save_campaign

logger = logging.getLogger(__name__)


def response_compiler_node(state: dict) -> dict:
    """
    Compile the final response.

    This node gathers outputs from previous nodes,
    saves the campaign, and returns a partial state update.
    """

    logger.info("Running Node 6: Response Compiler")
    
    final_response = {
        "whatsapp_copy": state.get("whatsapp_copy"),
        "instagram_caption": state.get("instagram_caption"),
        "image_url": state.get("image_url"),
        "tone": state["strategy"].get("tone"),
        "campaign_angle": state["strategy"].get("campaign_angle"),
    }

    campaign_id = None

    try:
        campaign_id = save_campaign(
            state=state,
            user_id=state["raw_input"]["user_id"],
        )

        logger.info(
            "Campaign saved successfully: %s",
            campaign_id,
        )

    except Exception:
        logger.warning(
            "Campaign save failed. Returning response anyway.",
            exc_info=True,
        )

    return {
        "final_response": final_response,
        "campaign_id": campaign_id,
    }