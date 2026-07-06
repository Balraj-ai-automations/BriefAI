from services.campaign_service import (
    save_campaign,
    get_campaigns,
)

dummy_state = {
    "business_profile": {
        "product": "Handmade Cotton Kurtis",
        "usp": "Pure Cotton",
        "price": "₹799",
        "offer": "Buy 2 Get 10% Off",
        "goal": "Increase Sales",
        "occasion": "Diwali",
        "buyer": "Women",
        "location": "Jaipur",
    },
    "app_language": "hi",
    "ig_language": "en",
    "wa_language": "hi",
    "whatsapp_copy": "Dummy WhatsApp Copy",
    "instagram_caption": "Dummy Instagram Caption",
    "image_url": "https://example.com/image.png",
    "image_prompt": "Luxury product photography",
}

user_id = "test-user-123"

campaign_id = save_campaign(dummy_state, user_id)

print("Campaign ID:", campaign_id)

campaigns = get_campaigns(user_id)

print(campaigns)