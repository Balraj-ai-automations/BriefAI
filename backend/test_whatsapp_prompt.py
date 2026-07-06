from prompts.copy_whatsapp import build_whatsapp_prompt

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

prompt = build_whatsapp_prompt(
    business_profile=business,
    strategy=strategy,
    language="Hindi",
)

print(prompt)