from dataclasses import dataclass
from typing import Any


@dataclass
class AIResponse:
    """
    Standard response returned by an AI provider.

    The rest of BriefAI should work with this structure
    instead of depending on provider-specific SDK responses.
    """

    content: str

    provider: str
    model: str

    usage: dict[str, Any] | None = None

    raw_response: Any | None = None