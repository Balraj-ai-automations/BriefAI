import logging

from agent.state import BriefAIState
from prompts.copy_whatsapp import build_whatsapp_prompt
from prompts.copy_instagram import build_instagram_prompt
from services.mistral import mistral_service

logger = logging.getLogger(__name__)


def copy_writer_node(state: BriefAIState) -> BriefAIState:
    """
    Generate platform-specific marketing copy.

    This node generates:
    - WhatsApp marketing message
    - Instagram caption
    """

    try:
        logger.info("Starting Copy Writer node.")

        # --------------------------------------------------
        # Step 1: Read data from state
        # --------------------------------------------------

        business_profile = state["business_profile"]
        strategy = state["strategy"]

        wa_language = state.get("wa_language", "English")
        ig_language = state.get("ig_language", "English")

        # --------------------------------------------------
        # Step 2: Build WhatsApp prompt
        # --------------------------------------------------

        whatsapp_prompt = build_whatsapp_prompt(
            business_profile=business_profile,
            strategy=strategy,
            wa_language=wa_language,
        )

        # --------------------------------------------------
        # Step 3: Generate WhatsApp copy
        # --------------------------------------------------

        whatsapp_copy = mistral_service.generate(
            whatsapp_prompt
        )

        # --------------------------------------------------
        # Step 4: Build Instagram prompt
        # --------------------------------------------------

        instagram_prompt = build_instagram_prompt(
            business_profile=business_profile,
            strategy=strategy,
            ig_language=ig_language,
        )

        # --------------------------------------------------
        # Step 5: Generate Instagram caption
        # --------------------------------------------------

        instagram_caption = mistral_service.generate(
            instagram_prompt
        )

        logger.info("Copy Writer node completed successfully.")

        return {
            "whatsapp_copy": whatsapp_copy.strip(),
            "instagram_caption": instagram_caption.strip(),
        }

    except Exception as e:
        logger.exception("Copy Writer node failed.")

        return {
            "error": str(e),
        }