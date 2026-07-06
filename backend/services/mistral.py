import logging
import os

from dotenv import load_dotenv
from mistralai.client import Mistral

# Load environment variables from the .env file
load_dotenv()

# Configure application logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class MistralService:
    """
    Service layer for interacting with the Mistral API.

    This class centralizes all communication with the Mistral API so
    the rest of the application remains independent of the underlying SDK.
    """

    def __init__(self) -> None:
        """
        Initialize the Mistral client using the API key from the
        environment variables.
        """

        self.api_key = os.getenv("MISTRAL_API_KEY")

        if not self.api_key:
            raise ValueError(
                "MISTRAL_API_KEY not found in environment variables."
            )

        self.client = Mistral(api_key=self.api_key)

        logger.info("Mistral client initialized successfully.")

    def generate(
        self,
        prompt: str,
        model: str = "mistral-small-latest",
        temperature: float = 0.7,
        max_tokens: int = 1000,
    ) -> str:
        """
        Generate a text completion using the Mistral API.

        Args:
            prompt: The input prompt sent to the model.
            model: The Mistral model to use.
            temperature: Controls the randomness of the response.
            max_tokens: Maximum number of tokens to generate.

        Returns:
            The generated text response.

        Raises:
            ValueError: If the API returns an empty response.
            Exception: If the Mistral SDK raises an error.
        """

        try:
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

            content = response.choices[0].message.content

            if not content:
                raise ValueError("Received an empty response from Mistral.")

            logger.info(
                "Generated response successfully using model '%s'.",
                model,
            )

            return content

        except Exception:
            logger.exception(
                "Error while generating response from Mistral."
            )
            raise


# Singleton instance used across the application.
mistral_service = MistralService()