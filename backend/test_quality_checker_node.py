from agent.nodes.quality_checker import quality_checker_node

state = {
    "business_profile": {
        "product": "Handmade Cotton Kurtis",
        "usp": "Premium handmade cotton",
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
    "whatsapp_copy": """
🎉 Diwali Special!

Premium Handmade Cotton Kurtis at just ₹799.

Get 10% OFF today.

Order now before the offer ends!
""",
    "instagram_caption": """
✨ Celebrate Diwali in style!

Our handmade cotton kurtis are crafted with love.

Avail 10% OFF today.

Shop now!

#HandmadeFashion #EthnicWear #IndianStyle
""",
    "wa_language": "Hindi",
    "ig_language": "English",
    "quality_passed": False,
    "quality_feedback": "",
    "quality_score": 0,
    "retry_count": 0,
    "error": None,
}

result = quality_checker_node(state)

print("\n===== Passed =====")
print(result["quality_passed"])

print("\n===== Score =====")
print(result["quality_score"])

print("\n===== Feedback =====")
print(result["quality_feedback"])

print("\n===== Error =====")
print(result["error"])