"""
Prompt builder for the Image Prompt Builder node.
"""


def build_image_prompt(
    business_profile: dict,
    strategy: dict,
) -> str:
    """
    Build the prompt for generating an image prompt using Mistral.
    """

    return f"""
You are an expert AI prompt engineer for product photography.

Your task is to generate an optimized FLUX.1 image prompt for an
Instagram marketing campaign.

Business Profile:

{business_profile}

Marketing Strategy:

{strategy}

Return ONLY valid JSON.

Structure:

{{
    "positive_prompt": "...",
    "negative_prompt": "...",
    "aspect_ratio": "1:1"
}}

Rules:

- Create a realistic product photography prompt.
- Match the marketing strategy and target audience.
- Include lighting, composition, background and photography style.
- Do NOT include text in the image.
- Do NOT include watermarks.
- Image should look premium and Instagram-ready.
- End the positive prompt with:
  "high resolution, photorealistic, ultra detailed, Instagram ready"

Negative prompt should include:

text, watermark, logo, blurry, low quality,
distorted, cartoon, duplicate
"""