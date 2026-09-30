"""
Deterministic validation utilities for BriefAI.

These checks do not use an LLM.
They enforce basic structural and formatting requirements
before the final response is returned.
"""

import re


def clean_generated_text(text: str) -> str:
    """
    Remove unwanted surrounding whitespace and quotation marks.

    Example:
        '"Hello world!"'
    becomes:
        'Hello world!'
    """

    if not text:
        return ""

    text = text.strip()

    # Remove matching surrounding quotes only.
    if len(text) >= 2:
        if (
            text.startswith('"')
            and text.endswith('"')
        ):
            text = text[1:-1].strip()

        elif (
            text.startswith("'")
            and text.endswith("'")
        ):
            text = text[1:-1].strip()

    return text


def count_hashtags(text: str) -> int:
    """
    Count hashtags in generated text.
    """

    if not text:
        return 0

    return len(
        re.findall(
            r"(?<!\w)#\w+",
            text,
        )
    )


def contains_cta(text: str) -> bool:
    """
    Check whether the generated copy contains
    a basic call-to-action.
    """

    if not text:
        return False

    text_lower = text.lower()

    cta_phrases = [
        "order now",
        "buy now",
        "shop now",
        "book now",
        "call now",
        "message us",
        "dm us",
        "contact us",
        "get yours",
        "grab yours",
        "place your order",
        "visit us",
        "try now",
        "get it now",
        "whatsapp us",
    ]

    return any(
        phrase in text_lower
        for phrase in cta_phrases
    )


def validate_marketing_copy(
    whatsapp_copy: str,
    instagram_caption: str,
    offer: str | None = None,
) -> dict:
    """
    Run deterministic checks against generated marketing copy.

    Returns a validation report.
    """

    whatsapp_copy = clean_generated_text(
        whatsapp_copy
    )

    instagram_caption = clean_generated_text(
        instagram_caption
    )

    errors = []
    warnings = []

    # --------------------------------------------------
    # WhatsApp validation
    # --------------------------------------------------

    if not whatsapp_copy:
        errors.append(
            "WhatsApp copy is empty."
        )

    if len(whatsapp_copy) > 700:
        warnings.append(
            "WhatsApp copy is unusually long."
        )

    if not contains_cta(whatsapp_copy):
        warnings.append(
            "WhatsApp copy does not contain a recognized CTA."
        )

    # --------------------------------------------------
    # Instagram validation
    # --------------------------------------------------

    if not instagram_caption:
        errors.append(
            "Instagram caption is empty."
        )

    if len(instagram_caption) > 2200:
        errors.append(
            "Instagram caption exceeds 2200 characters."
        )

    hashtag_count = count_hashtags(
        instagram_caption
    )

    if hashtag_count == 0:
        warnings.append(
            "Instagram caption contains no hashtags."
        )

    if hashtag_count > 15:
        warnings.append(
            "Instagram caption contains too many hashtags."
        )

    if not contains_cta(instagram_caption):
        warnings.append(
            "Instagram caption does not contain a recognized CTA."
        )

    # --------------------------------------------------
    # Offer validation
    # --------------------------------------------------

    if offer:
        offer_text = clean_generated_text(
            offer
        ).lower()

        generated_text = (
            whatsapp_copy + " " + instagram_caption
        ).lower()

        # We don't require the exact offer wording because
        # the model may naturally rewrite it.
        #
        # Instead, check whether at least some meaningful
        # offer-related language appears.
        offer_keywords = [
            "free",
            "off",
            "discount",
            "offer",
            "deal",
            "buy",
            "get",
            "save",
        ]

        if not any(
            keyword in generated_text
            for keyword in offer_keywords
        ):
            warnings.append(
                "The generated copy may not communicate the offer."
            )

    # --------------------------------------------------
    # Final result
    # --------------------------------------------------

    passed = len(errors) == 0

    return {
        "passed": passed,
        "errors": errors,
        "warnings": warnings,
        "whatsapp_length": len(whatsapp_copy),
        "instagram_length": len(instagram_caption),
        "hashtag_count": hashtag_count,
        "whatsapp_has_cta": contains_cta(
            whatsapp_copy
        ),
        "instagram_has_cta": contains_cta(
            instagram_caption
        ),
        "whatsapp_copy": whatsapp_copy,
        "instagram_caption": instagram_caption,
    }