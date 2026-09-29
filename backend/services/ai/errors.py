class AIProviderError(Exception):
    """Base exception for all AI provider errors."""

    def __init__(
        self,
        message: str,
        *,
        provider: str | None = None,
        retryable: bool = False,
    ) -> None:
        super().__init__(message)

        self.provider = provider
        self.retryable = retryable


class AIProviderRateLimitError(AIProviderError):
    """Raised when an AI provider rate-limits a request."""

    def __init__(
        self,
        message: str,
        *,
        provider: str | None = None,
    ) -> None:
        super().__init__(
            message,
            provider=provider,
            retryable=True,
        )


class AIProviderTimeoutError(AIProviderError):
    """Raised when an AI provider request times out."""

    def __init__(
        self,
        message: str,
        *,
        provider: str | None = None,
    ) -> None:
        super().__init__(
            message,
            provider=provider,
            retryable=True,
        )


class AIProviderAuthenticationError(AIProviderError):
    """Raised when provider authentication fails."""

    def __init__(
        self,
        message: str,
        *,
        provider: str | None = None,
    ) -> None:
        super().__init__(
            message,
            provider=provider,
            retryable=False,
        )


class AIProviderResponseError(AIProviderError):
    """Raised when a provider returns an invalid or empty response."""

    def __init__(
        self,
        message: str,
        *,
        provider: str | None = None,
    ) -> None:
        super().__init__(
            message,
            provider=provider,
            retryable=False,
        )