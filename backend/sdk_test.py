import os

from dotenv import load_dotenv
from mistralai.client import Mistral

load_dotenv()

client = Mistral(
    api_key=os.getenv("MISTRAL_API_KEY"),
)

response = client.chat.complete(
    model="mistral-small-latest",
    messages=[
        {
            "role": "user",
            "content": "Say hello in one sentence."
        }
    ]
)

print(response)