import json


def parse_json_safely(text: str) -> dict:
    """
    Cleans LLM responses and extracts valid JSON.

    Handles:
    - ```json ... ```
    - Extra text before JSON
    - Extra text after JSON
    """

    if not text:
        raise ValueError("Empty response received")

    # Remove markdown code fences
    text = text.replace("```json", "")
    text = text.replace("```", "")
    text = text.strip()

    # Find first opening brace
    start = text.find("{")
    if start == -1:
        raise ValueError("No JSON object found in response")

    # Find last closing brace
    end = text.rfind("}")
    if end == -1:
        raise ValueError("No closing JSON brace found in response")

    # Extract JSON only
    json_text = text[start:end + 1]

    try:
        return json.loads(json_text)

    except json.JSONDecodeError as e:
        raise ValueError(
            f"Invalid JSON returned by model: {e}"
        ) from e


if __name__ == "__main__":
    sample_response = """
    Here is the result:

    ```json
    {
        "tone": "warm",
        "campaign_angle": "Desi style, modern comfort"
    }
    ```

    Hope this helps!
    """

    result = parse_json_safely(sample_response)

    print("JSON parsed successfully:")
    print(result)