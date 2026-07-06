from typing import TypedDict, Optional


class BriefAIState(TypedDict):
    # Raw frontend input
    raw_input: dict

    # Language preferences
    app_language: str
    ig_language: str
    wa_language: str

    # Product image info
    has_product_image: bool
    product_image_base64: Optional[str]

    # Node 1 output
    business_profile: dict

    # Node 2 output
    strategy: dict

    # Node 3 output
    whatsapp_copy: str
    instagram_caption: str

    # Node 4 output
    image_prompt: str
    negative_prompt: str
    image_url: str
    image_source: str
    aspect_ratio: str

    # Node 5 output
    quality_passed: bool
    quality_feedback: Optional[str]
    retry_count: int

    # Node 6 output
    final_response: dict
    campaign_id: str

    # Error handling
    error: Optional[str]