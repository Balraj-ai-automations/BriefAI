from agent.nodes.copy_writer import copy_writer_node

state = {
    "business_profile": {
        "product": "Handmade Cotton Kurtis",
        "usp": "Handmade with premium cotton",
        "price": "₹799",
        "offer": "10% Off",
        "buyer": "Women aged 18-35",
        "location": "Bangalore",
        "goal": "Increase Sales",
        "occasion": "Diwali",
    },
    "strategy": {
        "tone": "Warm",
        "campaign_angle": "Celebrate Diwali with handmade fashion.",
        "hook": "Shine brighter this festive season!",
        "urgency_level": "High",
        "language_style": "Hinglish",
    },
    "wa_language": "Hindi",
    "ig_language": "English",
    "whatsapp_copy": "",
    "instagram_caption": "",
    "error": None,
}

result = copy_writer_node(state)

print("\n===== WhatsApp Copy =====\n")
print(result["whatsapp_copy"])

print("\n===== Instagram Caption =====\n")
print(result["instagram_caption"])

print("\n===== Error =====\n")
print(result["error"])