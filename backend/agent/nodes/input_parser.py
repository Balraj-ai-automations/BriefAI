import logging

from agent.state import BriefAIState
from agent.utils import parse_json_safely
from prompts.input_parser import build_input_parser_prompt
from services.ai.factory import get_ai_provider

logger = logging.getLogger(__name__)


def input_parser_node(state: BriefAIState) -> BriefAIState:
    """
    Parse the user's raw business information into a structured
    business profile using the configured AI provider.
    """
    try:
        logger.info("Starting Input Parser node.")

        # Read raw user input
        raw_input = state["raw_input"]

        # Build the Input Parser prompt
        prompt = build_input_parser_prompt(raw_input)

        # Call the configured AI provider
        ai_provider = get_ai_provider()
        response = ai_provider.generate(prompt,max_tokens=1500)

        # Parse AI JSON response
        business_profile = parse_json_safely(response)

        logger.info("Input Parser node completed successfully.")

        return {
            "business_profile": business_profile,
        }

    except Exception:
        logger.exception("Input Parser node failed.")
        raise