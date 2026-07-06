import json
import logging

from agent.state import BriefAIState
from prompts.strategy_planner import build_strategy_prompt
from services.mistral import mistral_service

logger = logging.getLogger(__name__)


def strategy_planner_node(state: BriefAIState) -> BriefAIState:
    """
    Generate a marketing strategy based on the structured
    business profile.
    """

    try:
        logger.info("Starting Strategy Planner node.")

        # Step 1: Read business profile from state
        business_profile = state["business_profile"]

        # Step 2: Build prompt
        prompt = build_strategy_prompt(
            business_profile=business_profile,
        )

        # Step 3: Generate response
        response = mistral_service.generate(prompt)

        # Step 4: Parse JSON response
        strategy = json.loads(response)

        logger.info("Strategy Planner node completed successfully.")

        # Step 5: Return only updated fields
        return {
            "strategy": strategy,
        }

    except Exception as e:
        logger.exception("Strategy Planner node failed.")

        return {
            "error": str(e),
        }