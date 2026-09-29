import logging
import os
import random
import threading
import time

from dotenv import load_dotenv
from mistralai.client import Mistral

load_dotenv()

logger = logging.getLogger(__name__)


class MistralRateLimitError(Exception):
    """Raised when Mistral rate-limits the application."""

    pass


class MistralService:
    """
    Centralized service for communication with the Mistral API.

    Handles:
    - API client initialization
    - Model configuration
    - Request pacing
    - Rate-limit retries
    - Consistent logging
    """

    def __init__(self) -> None:
        # --------------------------------------------------
        # API configuration
        # --------------------------------------------------
        self.api_key = os.getenv("MISTRAL_API_KEY")

        if not self.api_key:
            raise ValueError(
                "MISTRAL_API_KEY not found in environment variables."
            )

        self.client = Mistral(
            api_key=self.api_key
        )

        # --------------------------------------------------
        # Model configuration
        # --------------------------------------------------
        self.default_model = "mistral-small-2603"

        # Mistral limit:
        # 1 request / second
        #
        # Use 1.1 seconds as a safety margin.
        self.min_request_interval = 1.1

        # --------------------------------------------------
        # Request synchronization
        # --------------------------------------------------
        # Prevent multiple threads from sending Mistral
        # requests at the same time.
        self.request_lock = threading.Lock()

        # Track the last request time.
        self.last_request_time = 0.0

        logger.info(
            "Mistral client initialized successfully. model=%s",
            self.default_model,
        )

    def _wait_for_rate_limit(self) -> None:
        """
        Ensure requests are spaced according to the
        configured requests-per-second limit.
        """

        elapsed = (
            time.monotonic()
            - self.last_request_time
        )

        if elapsed < self.min_request_interval:
            wait_time = (
                self.min_request_interval
                - elapsed
            )

            logger.info(
                "Waiting %.2f seconds before Mistral request.",
                wait_time,
            )

            time.sleep(wait_time)

    def generate(
        self,
        prompt: str,
        model: str | None = None,
        temperature: float = 0.7,
        max_tokens: int = 1000,
    ) -> str:
        """
        Send a prompt to Mistral.

        Requests are:
        - serialized with a thread lock
        - spaced at least 1.1 seconds apart
        - retried when Mistral returns HTTP 429
        """

        model = model or self.default_model

        max_retries = 2

        for attempt in range(max_retries + 1):

            try:
                # --------------------------------------------------
                # Lock request execution
                # --------------------------------------------------
                with self.request_lock:

                    # Respect Mistral's request-per-second limit.
                    self._wait_for_rate_limit()

                    logger.info(
                        "Calling Mistral model=%s attempt=%s max_tokens=%s",
                        model,
                        attempt + 1,
                        max_tokens,
                    )

                    # Record request time immediately before
                    # sending the API request.
                    self.last_request_time = time.monotonic()

                    response = self.client.chat.complete(
                        model=model,
                        messages=[
                            {
                                "role": "user",
                                "content": prompt,
                            }
                        ],
                        temperature=temperature,
                        max_tokens=max_tokens,
                    )

                    # --------------------------------------------------
                    # Extract response
                    # --------------------------------------------------
                    content = (
                        response
                        .choices[0]
                        .message
                        .content
                    )

                    if not content:
                        raise ValueError(
                            "Received an empty response from Mistral."
                        )

                    logger.info(
                        "Mistral request successful. model=%s",
                        model,
                    )

                    return content

            except Exception as exc:

                # --------------------------------------------------
                # Detect HTTP status code
                # --------------------------------------------------
                status_code = None

                raw_response = getattr(
                    exc,
                    "raw_response",
                    None,
                )

                if raw_response is not None:
                    status_code = getattr(
                        raw_response,
                        "status_code",
                        None,
                    )

                # --------------------------------------------------
                # Handle rate limiting
                # --------------------------------------------------
                if status_code == 429:

                    if attempt >= max_retries:

                        logger.error(
                            "Mistral rate limit persisted after %s retries.",
                            max_retries,
                        )

                        raise MistralRateLimitError(
                            "Mistral API rate limit exceeded. "
                            "Please try again later."
                        ) from exc

                    # Exponential backoff:
                    #
                    # Attempt 1 -> ~1-2 seconds
                    # Attempt 2 -> ~2-3 seconds
                    wait_time = (
                        (2 ** attempt)
                        + random.uniform(0.2, 0.8)
                    )

                    logger.warning(
                        "Mistral rate limited the request. "
                        "Retry %s/%s in %.2f seconds.",
                        attempt + 1,
                        max_retries,
                        wait_time,
                    )

                    time.sleep(wait_time)

                    continue

                # --------------------------------------------------
                # Handle other API errors
                # --------------------------------------------------
                logger.exception(
                    "Unexpected Mistral API error. status_code=%s",
                    status_code,
                )

                raise

        # This should never normally execute.
        raise RuntimeError(
            "Unexpected Mistral service failure."
        )


# --------------------------------------------------
# Shared Mistral service instance
# --------------------------------------------------

mistral_service = MistralService()