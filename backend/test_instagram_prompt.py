from prompts.copy_instagram import build_instagram_prompt

business = {
    "product": "Handmade Cotton Kurtis",
    "price": "₹799",
    "offer": "20% OFF",
}

strategy = {
    "tone": "Warm",
    "campaign_angle": "Affordable festive fashion",
    "hook": "Celebrate Diwali in Style",
    "urgency_level": "High",
}

prompt = build_instagram_prompt(
    business_profile=business,
    strategy=strategy,
    language="English",
)

print(prompt)