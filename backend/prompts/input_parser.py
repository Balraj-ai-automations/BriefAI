"""
Prompt builder for the Input Parser node.

This prompt instructs the LLM to convert raw user input into a
structured business profile that downstream LangGraph nodes can use.
"""


def build_input_parser_prompt(raw_input: dict) -> str:
    """
    Build the prompt for the Input Parser node.

    Args:
        raw_input: Dictionary containing the user's answers from the frontend.

    Returns:
        A formatted prompt string for the Mistral model.
    """

    return f"""
You are an expert at understanding Indian small businesses.

The business owner may answer in Hindi, Hinglish, English, or any regional language.

Your job is to understand the business and convert the information into a structured JSON object.

Rules:

- Return ONLY valid JSON.
- Do NOT include markdown.
- Do NOT include explanations.
- Do NOT include code fences.
- If information is missing, return null.
- Infer business type whenever possible.
- Keep extracted values short and clean.

User Input:

{raw_input}

Return this exact JSON structure:

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