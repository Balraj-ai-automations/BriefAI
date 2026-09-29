from fastapi import APIRouter, HTTPException

from agent.graph import graph
from models.request import GenerateRequest
from models.response import GenerateResponse
from services.ai.errors import AIProviderRateLimitError

router = APIRouter(tags=["Generate"])


@router.post(
    "/generate",
    response_model=GenerateResponse,
)
def generate_campaign(request: GenerateRequest):
    """
    Generate a complete marketing campaign.
    """
    try:
        initial_state = {
            "raw_input": request.model_dump(),

            # Language preferences
            "app_language": request.app_language,
            "ig_language": request.ig_language,
            "wa_language": request.wa_language,

            # Product image info
            "has_product_image": request.has_product_image,
            "product_image_base64": request.product_image_base64,

            # Node 1 output
            "business_profile": {},

            # Node 2 output
            "strategy": {},

            # Node 3 output
            "whatsapp_copy": "",
            "instagram_caption": "",

            # Node 4 output
            "image_prompt": "",
            "negative_prompt": "",
            "image_url": "",
            "image_source": "",
            "aspect_ratio": "",

            # Node 5 output
            "quality_passed": False,
            "quality_feedback": None,
            "quality_score": None,
            "retry_count": 0,

            # Node 6 output
            "final_response": {},
            "campaign_id": "",

            # Error handling
            "error": None,
        }

        result = graph.invoke(initial_state)

        # Handle errors returned through graph state
        if result.get("error"):
            raise HTTPException(
                status_code=500,
                detail=result["error"],
            )

        return GenerateResponse(
            campaign_id=result.get("campaign_id"),
            whatsapp_copy=result["final_response"]["whatsapp_copy"],
            instagram_caption=result["final_response"]["instagram_caption"],
            image_url=result["final_response"]["image_url"],
            tone=result["final_response"]["tone"],
            campaign_angle=result["final_response"]["campaign_angle"],
        )

    except HTTPException:
        raise

    except AIProviderRateLimitError as e:
        raise HTTPException(
            status_code=503,
            detail={
                "message": str(e),
                "retryable": e.retryable,
                "provider": e.provider,
            },
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e),
        )