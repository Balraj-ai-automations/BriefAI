"""
Quality Checker Node for BriefAI.

The Quality Checker performs two layers of validation:

1. LLM-based marketing quality review
2. Deterministic validation of generated marketing copy

The campaign passes only when both checks pass.
"""

from services.ai.factory import get_ai_provider
from agent.utils import parse_json_safely
from agent.validators import validate_marketing_copy


def build_quality_checker_prompt(
    business_profile: dict,
    strategy: dict,
    whatsapp_copy: str,
    instagram_caption: str,
    wa_language: str,
    ig_language: str,
) -> str:
    """
    Build the prompt used by the LLM Quality Checker.
    """

    return f"""
You are a senior marketing quality reviewer for BriefAI,
an AI marketing assistant for Indian small businesses.

Your task is to evaluate the generated marketing content
against the business profile, marketing strategy, and campaign
requirements.

BUSINESS PROFILE:
{business_profile}

MARKETING STRATEGY:
{strategy}

WHATSAPP COPY:
{whatsapp_copy}

INSTAGRAM CAPTION:
{instagram_caption}

EXPECTED WHATSAPP LANGUAGE:
{wa_language}

EXPECTED INSTAGRAM LANGUAGE:
{ig_language}


REVIEW CHECKLIST:

1. Does the content match the business goal?

2. Does the content match the product and business profile?

3. Does the content follow the marketing strategy?

4. Is the tone appropriate for the target customer?

5. Is the WhatsApp message natural, personal, and easy to understand?

6. Does the Instagram caption begin with a strong hook?

7. Does the Instagram caption contain relevant hashtags?

8. Are both outputs written in their expected languages?

9. Is the offer included correctly when an offer is available?

10. Is there a clear call to action?

11. Are there obvious grammar or spelling problems?

12. Is the content suitable for an Indian small business?

13. Does the content sound natural rather than robotic or generic?


SCORING:

Give the content a quality score from 0 to 10.

10 = Excellent
8-9 = Very good
6-7 = Acceptable but needs improvement
4-5 = Poor
0-3 = Very poor

The score MUST be a numeric value.

The score MUST be between 0 and 10.

The score MUST NOT be null.

The score MUST NOT be omitted.

The score MUST NOT be a string.

Determine "passed" based on the overall quality of the content.

If the content has serious problems, set "passed" to false.

If the content is acceptable and satisfies the campaign requirements,
set "passed" to true.


OUTPUT REQUIREMENTS:

Return ONLY valid JSON.

You MUST return exactly these three fields:

- passed
- score
- feedback

"passed" MUST be a boolean: true or false.

"score" MUST be a number between 0 and 10.

"feedback" MUST be a short string explaining the main quality result.

Do NOT omit any field.

Do NOT return null for any field.

Do NOT use markdown.

Do NOT use code fences.

Do NOT include explanations outside the JSON.

Return exactly this structure:

{{
    "passed": true,
    "score": 8.5,
    "feedback": "The content is relevant, natural, follows the strategy, includes the offer, and has a clear call to action."
}}
"""


def quality_checker_node(state: dict) -> dict:
    """
    Review generated marketing content using both an LLM
    and deterministic validation rules.

    If quality fails, retry_count is incremented.
    LangGraph decides whether the workflow should retry
    based on retry_count.
    """

    # ---------------------------------------------------------
    # 1. Read state
    # ---------------------------------------------------------

    business_profile = state.get("business_profile", {})
    strategy = state.get("strategy", {})

    whatsapp_copy = state.get("whatsapp_copy", "")
    instagram_caption = state.get("instagram_caption", "")

    wa_language = state.get(
        "wa_language",
        "English",
    )

    ig_language = state.get(
        "ig_language",
        "English",
    )

    offer = business_profile.get("offer")

    current_retry_count = state.get(
        "retry_count",
        0,
    )

    # ---------------------------------------------------------
    # 2. Build quality-check prompt
    # ---------------------------------------------------------

    prompt = build_quality_checker_prompt(
        business_profile=business_profile,
        strategy=strategy,
        whatsapp_copy=whatsapp_copy,
        instagram_caption=instagram_caption,
        wa_language=wa_language,
        ig_language=ig_language,
    )

    # ---------------------------------------------------------
    # 3. Get AI provider
    # ---------------------------------------------------------

    provider = get_ai_provider()

    # ---------------------------------------------------------
    # 4. Run LLM quality check
    # ---------------------------------------------------------

    try:
        response = provider.generate(
            prompt,
            temperature=0.2,
            max_tokens=500,
        )

        # Use the shared JSON parser so the node can safely
        # handle JSON returned inside accidental code fences
        # or surrounding text.
        review = parse_json_safely(response)

        # Temporary debugging.
        # Keep these while verifying the quality score.
        print("\nQUALITY REVIEW RAW RESPONSE:")
        print(response)

        print("\nQUALITY REVIEW PARSED:")
        print(review)

    except Exception as exc:
        print("\nQUALITY CHECKER ERROR:")
        print(str(exc))

        return {
            "quality_passed": False,
            "quality_feedback": (
                f"Quality checker failed: {str(exc)}"
            ),
            "quality_score": None,
            "retry_count": current_retry_count + 1,
        }

    # ---------------------------------------------------------
    # 5. Extract LLM review
    # ---------------------------------------------------------

    llm_passed = bool(
        review.get("passed", False)
    )

    raw_score = review.get("score")

    # Convert the score to float safely.
    try:
        quality_score = (
            float(raw_score)
            if raw_score is not None
            else None
        )
    except (TypeError, ValueError):
        quality_score = None

    # Protect against invalid model scores.
    if quality_score is not None:
        if quality_score < 0 or quality_score > 10:
            quality_score = None

    llm_feedback = str(
        review.get(
            "feedback",
            "No additional feedback provided.",
        )
    ).strip()

    # ---------------------------------------------------------
    # 6. Deterministic validation
    # ---------------------------------------------------------

    validation = validate_marketing_copy(
        whatsapp_copy=whatsapp_copy,
        instagram_caption=instagram_caption,
        offer=offer,
    )

    deterministic_passed = bool(
        validation.get("passed", False)
    )

    validation_errors = validation.get(
        "errors",
        [],
    )

    validation_warnings = validation.get(
        "warnings",
        [],
    )

    # ---------------------------------------------------------
    # 7. Final quality decision
    # ---------------------------------------------------------

    quality_passed = (
        llm_passed
        and deterministic_passed
    )

    # ---------------------------------------------------------
    # 8. Build combined feedback
    # ---------------------------------------------------------

    feedback_parts = []

    if llm_feedback:
        feedback_parts.append(
            f"LLM review: {llm_feedback}"
        )

    if validation_errors:
        feedback_parts.append(
            "Validation errors: "
            + "; ".join(validation_errors)
        )

    if validation_warnings:
        feedback_parts.append(
            "Validation warnings: "
            + "; ".join(validation_warnings)
        )

    if feedback_parts:
        quality_feedback = "\n".join(
            feedback_parts
        )
    else:
        quality_feedback = (
            "Content passed all quality checks."
        )

    # ---------------------------------------------------------
    # 9. Retry handling
    # ---------------------------------------------------------

    if quality_passed:
        new_retry_count = current_retry_count
    else:
        new_retry_count = current_retry_count + 1

    # ---------------------------------------------------------
    # 10. Return state updates
    # ---------------------------------------------------------

    return {
        "quality_passed": quality_passed,

        "quality_feedback": quality_feedback,

        "quality_score": quality_score,

        "retry_count": new_retry_count,

        # Return cleaned versions from deterministic validation.
        "whatsapp_copy": validation.get(
            "whatsapp_copy",
            whatsapp_copy,
        ),

        "instagram_caption": validation.get(
            "instagram_caption",
            instagram_caption,
        ),
    }