from services.ai.base import AIProvider

from services.mistral import mistral_service


class MistralProvider(AIProvider):
    """
    Adapter around the existing BriefAI Mistral service.

    The existing MistralService remains responsible for:
    - request rate limiting
    - request synchronization
    - retries
    - exponential backoff
    - Mistral SDK interaction
    """

    provider_name = "mistral"

    def __init__(self) -> None:
        self.service = mistral_service

    def generate(
        self,
        prompt: str,
        *,
        model: str | None = None,
        temperature: float = 0.7,
        max_tokens: int = 1000,
    ) -> str:
        return self.service.generate(
            prompt,
            model=model,
            temperature=temperature,
            max_tokens=max_tokens,
        )