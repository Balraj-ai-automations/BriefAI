from agent.graph import graph


initial_state = {
    "raw_input": {
    "user_id": "test-user-123",
    "name": "Priya",
    "product": "handmade cotton kurtis",
    "usp": "pure cotton, hand block printed",
    "price": "800 to 1500",
    "offer": "Buy 2 get 10% off",
    "buyer": "women aged 25-45",
    "location": "Jaipur",
    "occasion": "No occasion",
    "goal": "Zyada bikri",
},
    "app_language": "en",
    "ig_language": "en",
    "wa_language": "en",

    "has_product_image": False,
    "product_image_base64": None,

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

print("\n")
print("=" * 50)
print("FINAL RESPONSE")
print("=" * 50)
print(result["final_response"])