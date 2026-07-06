from prompts.quality_checker import build_quality_checker_prompt

business = {
    "product": "Handmade Cotton Kurtis",
    "goal": "Increase Sales",
}

strategy = {
    "tone": "Warm",
    "campaign_angle": "Affordable festive fashion",
}

whatsapp = """
✨ Handmade cotton kurtis now available!

Special festive offer 🎉

Reply now to order yours.
"""

instagram = """
✨ Celebrate Diwali in Style!

Beautiful handmade cotton kurtis designed for comfort and elegance.

Order today and enjoy our festive discount!

#HandmadeFashion #IndianWear #Kurti #SmallBusiness
"""

prompt = build_quality_checker_prompt(
    business_profile=business,
    strategy=strategy,
    whatsapp_copy=whatsapp,
    instagram_caption=instagram,
)

print(prompt)