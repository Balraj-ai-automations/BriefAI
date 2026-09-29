import json
import logging

from agent.state import BriefAIState
from prompts.strategy_planner import build_strategy_prompt
from services.mistral import mistral_service

logger = logging.getLogger(__name__)


def strategy_planner_node(state: BriefAIState) -> BriefAIState:
    """
    Create a marketing strategy from the structured business profile.
    """

    try:
        logger.info("Starting Strategy Planner node.")

        # Read business profile from Input Parser
        business_profile = state["business_profile"]

        # Build strategy prompt
        prompt = build_strategy_prompt(
            business_profile=business_profile,
        )

        # Call Mistral
        response = mistral_service.generate(prompt)

        # Parse JSON response
        strategy = json.loads(response)

        logger.info("Strategy Planner node completed successfully.")

        return {
            "strategy": strategy,
        }

    except Exception as e:
        logger.exception("Strategy Planner node failed.")
        raise