from pydantic import BaseModel


class GenerateResponse(BaseModel):
    campaign_id: str | None = None
    whatsapp_copy: str
    instagram_caption: str
    image_url: str
    tone: str
    campaign_angle: str