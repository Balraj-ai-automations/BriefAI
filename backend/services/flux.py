import io
import logging
import os
import time

from dotenv import load_dotenv
from huggingface_hub import InferenceClient

load_dotenv()

logger = logging.getLogger(__name__)

HF_TOKEN = os.getenv("HUGGINGFACE_API_TOKEN")

if not HF_TOKEN:
    raise ValueError("HUGGINGFACE_API_TOKEN not found in .env")

IMAGE_PROVIDER = os.getenv("HF_IMAGE_PROVIDER", "auto")
IMAGE_MODEL = os.getenv(
    "HF_IMAGE_MODEL",
    "black-forest-labs/FLUX.1-schnell",
)

client = InferenceClient(
    provider=IMAGE_PROVIDER,
    api_key=HF_TOKEN,
)


def generate_image(
    prompt: str,
    negative_prompt: str = "",
    aspect_ratio: str = "1:1",
) -> bytes:
    """
    Generate an image using Hugging Face Inference Providers.

    Returns:
        Raw JPEG image bytes.
    """

    start = time.perf_counter()

    try:
        image = client.text_to_image(
            prompt=prompt,
            model=IMAGE_MODEL,
        )

        buffer = io.BytesIO()
        image.save(buffer, format="JPEG")

        elapsed = time.perf_counter() - start

        logger.info(
            "FLUX image generated successfully in %.2f seconds",
            elapsed,
        )

        return buffer.getvalue()

    except Exception as e:
        logger.exception("Image generation failed")
        raise RuntimeError(
            f"FLUX generation failed: {e}"
        ) from e