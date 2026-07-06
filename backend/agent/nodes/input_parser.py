import json
import logging

from agent.state import BriefAIState
from prompts.input_parser import build_input_parser_prompt
from services.mistral import mistral_service

logger = logging.getLogger(__name__)


def input_parser_node(state: BriefAIState) -> BriefAIState:
    """
    Parse the user's raw business information into a structured
    business profile using the Mistral API.
    """

    try:
        logger.info("Starting Input Parser node.")

        # Step 1: Read raw input
        raw_input = state["raw_input"]

        # Step 2: Build prompt
        prompt = build_input_parser_prompt(raw_input)

        # Step 3: Generate response
        response = mistral_service.generate(prompt)

        # Step 4: Parse JSON
        business_profile = json.loads(response)

        logger.info("Input Parser node completed successfully.")

        # Step 5: Return only updated fields
        return {
            "business_profile": business_profile,
        }

    except Exception as e:
        logger.exception("Input Parser node failed.")

        return {
            "error": str(e),
        }