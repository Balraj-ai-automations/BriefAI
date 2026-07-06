from agent.nodes.image_prompt_builder import image_prompt_builder_node

state = {
"business_profile": {
    "product": "Mobile Repair Service",
    "usp": "Same-day repair",
    "price": "Starting ₹199",
    "offer": "Free Pickup",
    "buyer": "Smartphone Users",
    "location": "Mysore",
    "occasion": "None",
    "goal": "Generate Leads",
    "business_type": "Service",
},

"strategy": {
    "tone": "Professional",
    "campaign_angle": "Fast and reliable repair",
    "hook": "Broken phone? We fix it today.",
    "urgency_level": "High",
    "language_style": "English",
},
}

result = image_prompt_builder_node(state)

print("\nImage URL:")
print(result.get("image_url"))

print("\nImage Source:")
print(result.get("image_source"))

print("\nPrompt:")
print(result.get("image_prompt"))

print("\nError:")
print(result.get("error"))

if result.get("error") is None:
    print("\n✅ TEST PASSED")
else:
    print("\n❌ TEST FAILED")