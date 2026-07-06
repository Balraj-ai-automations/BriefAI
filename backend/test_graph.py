"""
Integration test for the complete BriefAI LangGraph pipeline.

Run:
    python test_graph.py
"""

from agent.graph import graph


# --------------------------------------------------
# Initial State
# --------------------------------------------------

initial_state = {
    # -----------------------------
    # Frontend Input
    # -----------------------------
    "raw_input": {
        "business_name": "Sri Lakshmi Bakery",
        "business_type": "Bakery",
        "product": "Fresh Chocolate Cake",
        "target_customer": "Families and students",
        "location": "Bangalore",
        "goal": "Increase weekend sales",
        "offer": "Buy 1 Get 1 Cupcake Free",
        "occasion": "Weekend Special",
    },

    # -----------------------------
    # Language Preferences
    # -----------------------------
    "app_language": "English",
    "wa_language": "English",
    "ig_language": "English",

    # -----------------------------
    # Product Image
    # -----------------------------
    "has_product_image": False,
    "product_image_base64": None,

    # -----------------------------
    # Node 1 Output
    # -----------------------------
    "business_profile": {},

    # -----------------------------
    # Node 2 Output
    # -----------------------------
    "strategy": {},

    # -----------------------------
    # Node 3 Output
    # -----------------------------
    "whatsapp_copy": "",
    "instagram_caption": "",

    # -----------------------------
    # Node 4 Output
    # -----------------------------
    "image_prompt": "",
    "negative_prompt": "",
    "image_url": "",
    "replicate_url": "",
    "aspect_ratio": "1:1",

    # -----------------------------
    # Node 5 Output
    # -----------------------------
    "quality_passed": False,
    "quality_score": 0,
    "quality_feedback": "",
    "retry_count": 0,

    # -----------------------------
    # Node 6 Output
    # -----------------------------
    "final_response": {},
    "campaign_id": "",

    # -----------------------------
    # Error Handling
    # -----------------------------
    "error": None,
}


# --------------------------------------------------
# Run Graph
# --------------------------------------------------

print("=" * 70)
print("🚀 Running BriefAI LangGraph Integration Test")
print("=" * 70)

try:
    result = graph.invoke(initial_state)

    print("\n" + "=" * 70)
    print("✅ PIPELINE EXECUTED SUCCESSFULLY")
    print("=" * 70)

    print("\n📌 Business Profile")
    print(result.get("business_profile"))

    print("\n📌 Marketing Strategy")
    print(result.get("strategy"))

    print("\n📌 WhatsApp Copy")
    print(result.get("whatsapp_copy"))

    print("\n📌 Instagram Caption")
    print(result.get("instagram_caption"))

    print("\n📌 Image Prompt")
    print(result.get("image_prompt"))

    print("\n📌 Negative Prompt")
    print(result.get("negative_prompt"))

    print("\n📌 Quality Passed")
    print(result.get("quality_passed"))

    print("\n📌 Quality Score")
    print(result.get("quality_score"))

    print("\n📌 Quality Feedback")
    print(result.get("quality_feedback"))

    print("\n📌 Retry Count")
    print(result.get("retry_count"))

    print("\n📌 Final Response")
    print(result.get("final_response"))

    print("\n📌 Campaign ID")
    print(result.get("campaign_id"))

    print("\n📌 Error")
    print(result.get("error"))

except Exception as e:
    print("\n" + "=" * 70)
    print("❌ PIPELINE FAILED")
    print("=" * 70)
    print(e)