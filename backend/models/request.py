from typing import Optional

from pydantic import BaseModel


class GenerateRequest(BaseModel):
    user_id: str
    name: str
    product: str
    usp: str
    price: str
    offer: Optional[str] = None
    buyer: str
    location: str
    occasion: str
    goal: str

    app_language: str
    ig_language: str
    wa_language: str

    has_product_image: bool = False
    product_image_base64: Optional[str] = None