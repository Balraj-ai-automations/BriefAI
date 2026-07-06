import json
import logging

from agent.state import BriefAIState
from prompts.image_builder import build_image_prompt
from services.flux import generate_image
from services.image_storage import save_image_bytes
from services.mistral import mistral_service

logger = logging.getLogger(__name__)


def image_prompt_builder_node(
    state: BriefAIState,
) -> BriefAIState:
    """
    Node 4:
    1. Ask Mistral to build an optimized FLUX prompt.
    2. Generate the image using Hugging Face FLUX.
    3. Upload the image to Supabase Storage.
    4. Return only the updated state fields.
    """

    try:
        logger.info("Starting Image Prompt Builder node.")

        # --------------------------------------------------
        # Step 1: Read state
        # --------------------------------------------------
        business_profile = state["business_profile"]
        strategy = state["strategy"]

        # --------------------------------------------------
        # Step 2: Build image prompt
        # --------------------------------------------------
        prompt = build_image_prompt(
            business_profile=business_profile,
            strategy=strategy,
        )

        # --------------------------------------------------
        # Step 3: Generate prompt JSON using Mistral
        # --------------------------------------------------
        response = mistral_service.generate(prompt)

        print("\n========== RAW MISTRAL RESPONSE ==========")
        print(response)
        print("==========================================\n")

        response = response.strip()

        if response.startswith("```"):
            response = (
                response.replace("```json", "")
                .replace("```", "")
                .strip()
            )

        image_config = json.loads(response)

        positive_prompt = image_config["positive_prompt"]
        negative_prompt = image_config["negative_prompt"]
        aspect_ratio = image_config.get(
            "aspect_ratio",
            "1:1",
        )

        # --------------------------------------------------
        # Step 4: Generate image using FLUX
        # --------------------------------------------------
        image_bytes = generate_image(
            prompt=positive_prompt,
            negative_prompt=negative_prompt,
            aspect_ratio=aspect_ratio,
        )

        # --------------------------------------------------
        # Step 5: Upload image to Supabase Storage
        # --------------------------------------------------
        image_url = save_image_bytes(image_bytes)

        logger.info("Image Prompt Builder node completed successfully.")

        # --------------------------------------------------
        # Step 6: Return only updated fields
        # --------------------------------------------------
        return {
            "image_prompt": positive_prompt,
            "negative_prompt": negative_prompt,
            "aspect_ratio": aspect_ratio,
            "image_source": "huggingface",
            "image_url": image_url,
        }

    except Exception as e:
        logger.exception("Image Prompt Builder node failed.")

        return {
            "error": str(e),
        }