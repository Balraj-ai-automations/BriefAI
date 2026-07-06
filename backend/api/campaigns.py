from fastapi import APIRouter, HTTPException

from services.campaign_service import get_campaigns

router = APIRouter(tags=["Campaigns"])


@router.get("/campaigns/{user_id}")
def campaign_history(user_id: str):
    """
    Return campaign history for a user.
    """

    try:
        campaigns = get_campaigns(user_id)

        return {
            "campaigns": campaigns,
            "count": len(campaigns),
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e),
        )