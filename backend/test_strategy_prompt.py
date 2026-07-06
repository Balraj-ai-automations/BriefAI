from prompts.strategy_planner import build_strategy_prompt

business = {
    "product": "Handmade Cotton Kurtis",
    "price": "₹799",
    "buyer_gender": "Female",
    "buyer_age": "18-30",
    "business_type": "Clothing"
}

prompt = build_strategy_prompt(
    business_profile=business,
    goal="Increase Sales",
    occasion="Diwali",
)

print(prompt)