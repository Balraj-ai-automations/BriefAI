import logging

from agent.state import BriefAIState
from prompts.copy_instagram import build_instagram_prompt
from prompts.copy_whatsapp import build_whatsapp_prompt
from services.mistral import mistral_service

logger = logging.getLogger(__name__)


def copy_writer_node(state: BriefAIState) -> BriefAIState:
    """
    Generate WhatsApp and Instagram marketing copy.
    """

    try:
        logger.info("Starting Copy Writer node.")

        # Get data produced by previous nodes
        business_profile = state["business_profile"]
        strategy = state["strategy"]

        wa_language = state["wa_language"]
        ig_language = state["ig_language"]

        # --------------------------------------------------
        # WhatsApp Copy
        # --------------------------------------------------

        logger.info("Generating WhatsApp copy.")

        whatsapp_prompt = build_whatsapp_prompt(
            business_profile=business_profile,
            strategy=strategy,
            wa_language=wa_language,
        )

        whatsapp_copy = mistral_service.generate(
            prompt=whatsapp_prompt,
        ).strip()

        # --------------------------------------------------
        # Instagram Copy
        # --------------------------------------------------

        logger.info("Generating Instagram caption.")

        instagram_prompt = build_instagram_prompt(
            business_profile=business_profile,
            strategy=strategy,
            ig_language=ig_language,
        )

        instagram_caption = mistral_service.generate(
            prompt=instagram_prompt,
        ).strip()

        logger.info("Copy Writer node completed successfully.")

        return {
            "whatsapp_copy": whatsapp_copy,
            "instagram_caption": instagram_caption,
        }

    except Exception as e:
        logger.exception("Copy Writer node failed.")
        raise