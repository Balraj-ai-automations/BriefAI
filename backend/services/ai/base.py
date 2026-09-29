from abc import ABC, abstractmethod


class AIProvider(ABC):
    """
    Common interface for all BriefAI text-generation providers.

    LangGraph nodes should depend on this interface,
    not on a specific AI provider such as Mistral or Hugging Face.
    """

    @abstractmethod
    def generate(
        self,
        prompt: str,
        *,
        model: str | None = None,
        temperature: float = 0.7,
        max_tokens: int = 1000,
    ) -> str:
        """
        Generate a text response from the AI provider.

        Args:
            prompt: Prompt sent to the model.
            model: Optional model override.
            temperature: Sampling temperature.
            max_tokens: Maximum response tokens.

        Returns:
            Generated text response.

        Raises:
            Exception:
                Provider-specific errors should be translated
                by the provider implementation.
        """
        raise NotImplementedError