from fastapi import APIRouter, HTTPException

from agent.graph import graph
from models.request import GenerateRequest
from models.response import GenerateResponse

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

            "app_language": request.app_language,
            "ig_language": request.ig_language,
            "wa_language": request.wa_language,

            "has_product_image": request.has_product_image,
            "product_image_base64": request.product_image_base64,

            "business_profile": {},
            "strategy": {},

            "whatsapp_copy": "",
            "instagram_caption": "",

            "image_prompt": "",
            "negative_prompt": "",
            "image_url": "",
            "replicate_url": "",
            "aspect_ratio": "",

            "quality_passed": False,
            "quality_feedback": None,
            "retry_count": 0,

            "final_response": {},
            "campaign_id": "",
            "error": None,
        }

        result = graph.invoke(initial_state)

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

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e),
        )