"""
Prompt builder for the Input Parser node.

Converts raw user business information into a structured
business profile for downstream LangGraph nodes.
"""


def build_input_parser_prompt(raw_input: dict) -> str:
    """
    Build the prompt for the Input Parser node.
    """

    return f"""
You are a business information extraction system for Indian small businesses.

Read the user's input and extract the business information into JSON.

IMPORTANT:
- Output ONLY the JSON object.
- Do NOT explain your answer.
- Do NOT use Markdown.
- Do NOT use ``` fences.
- Do NOT include reasoning.
- Do NOT add text before or after the JSON.
- Use null when information is missing.
- Do not invent facts.
- Keep values short and clean.
- You may understand Hindi, Hinglish, English, Kannada, Tamil, Telugu,
  Marathi, and other Indian languages.
- Preserve the user's meaning.
- Infer business_type only when it is reasonably clear.

USER INPUT:
{raw_input}

OUTPUT EXACTLY THIS JSON STRUCTURE:

{{
    "product": "",
    "usp": "",
    "price": "",
    "price_level": "",
    "offer": null,
    "has_offer": false,
    "buyer_age": "",
    "buyer_gender": "",
    "buyer_type": "",
    "location": "",
    "pan_india": false,
    "occasion": null,
    "goal": "",
    "business_type": ""
}}
"""