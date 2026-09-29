import os

from services.ai.base import AIProvider
from services.ai.providers.huggingface import HuggingFaceProvider
from services.ai.providers.mistral import MistralProvider


def get_ai_provider() -> AIProvider:
    """
    Return the configured BriefAI AI provider.

    Provider selection is controlled by AI_PROVIDER.
    """

    provider = os.getenv(
        "AI_PROVIDER",
        "huggingface",
    ).strip().lower()

    if provider == "huggingface":
        return HuggingFaceProvider()

    if provider == "mistral":
        return MistralProvider()

    raise ValueError(
        f"Unsupported AI_PROVIDER: {provider!r}. "
        "Expected 'huggingface' or 'mistral'."
    )