import logging
import os

from huggingface_hub import InferenceClient

from services.ai.base import AIProvider
from services.ai.errors import (
    AIProviderAuthenticationError,
    AIProviderError,
    AIProviderRateLimitError,
    AIProviderResponseError,
    AIProviderTimeoutError,
)

logger = logging.getLogger(__name__)


class HuggingFaceProvider(AIProvider):
    """Hugging Face Inference Providers implementation."""

    provider_name = "huggingface"

    def __init__(
        self,
        *,
        api_token: str | None = None,
        model: str | None = None,
        provider: str | None = None,
    ) -> None:
        self.api_token = api_token or os.getenv("HUGGINGFACE_API_TOKEN")
        self.model = model or os.getenv("HF_MODEL")
        self.provider = provider or os.getenv("HF_PROVIDER", "auto")

        if not self.api_token:
            raise AIProviderAuthenticationError(
                "Hugging Face API token is not configured.",
                provider=self.provider_name,
            )

        if not self.model:
            raise AIProviderError(
                "Hugging Face model is not configured.",
                provider=self.provider_name,
            )

        self.client = InferenceClient(
            model=self.model,
            provider=self.provider,
            api_key=self.api_token,
            timeout=120,
        )

    def generate(
        self,
        prompt: str,
        *,
        model: str | None = None,
        temperature: float = 0.7,
        max_tokens: int = 1000,
    ) -> str:
        selected_model = model or self.model

        try:
            response = self.client.chat.completions.create(
                model=selected_model,
                messages=[
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                temperature=temperature,
                max_tokens=max_tokens,
                
            )
           
        except Exception as exc:
            error_text = str(exc).lower()

            if "401" in error_text or "403" in error_text:
                raise AIProviderAuthenticationError(
                    "Hugging Face authentication failed.",
                    provider=self.provider_name,
                ) from exc

            if "429" in error_text or "rate limit" in error_text:
                raise AIProviderRateLimitError(
                    "Hugging Face rate limit reached.",
                    provider=self.provider_name,
                ) from exc

            if "timeout" in error_text or "timed out" in error_text:
                raise AIProviderTimeoutError(
                    "Hugging Face request timed out.",
                    provider=self.provider_name,
                ) from exc

            logger.exception(
                "Hugging Face generation failed."
            )

            raise AIProviderError(
                "Hugging Face generation failed.",
                provider=self.provider_name,
            ) from exc

        message = response.choices[0].message
        content = message.content

        if not content and getattr(message, "reasoning_content", None):
            logger.warning(
                "Hugging Face returned reasoning without final content. "
                "The model may have exhausted its token budget."
            )

        if not content or not content.strip():
            raise AIProviderResponseError(
                "Hugging Face returned an empty response.",
                provider=self.provider_name,
            )

        return content.strip()