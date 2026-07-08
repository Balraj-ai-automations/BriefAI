"""
PHASE 6 TEST — Direct Instagram posting test.
Uses your .env credentials directly.
No Supabase lookup needed for this test.

Run: python test_instagram_post.py
"""

import asyncio
import os
from dotenv import load_dotenv
from services.instagram_poster import post_to_instagram

load_dotenv()

# Read from .env
ACCESS_TOKEN = os.getenv("INSTAGRAM_ACCESS_TOKEN")
IG_USER_ID = os.getenv("INSTAGRAM_USER_ID")

# Test image — public URL (Wikipedia image — safe for testing)
TEST_IMAGE_URL = "https://szfybhgnvlkixxvjkbel.supabase.co/storage/v1/object/public/images/campaigns/582a26e9-1321-4180-97c5-d48e814167f0.jpg"
TEST_CAPTION = "Test post from BriefAI 🚀\n\nApna product batao. BriefAI baaki sab karta hai.\n\n#briefai #india #smallbusiness #marketing"

async def test():
    print("=" * 50)
    print("BRIEFAI — INSTAGRAM POSTING TEST")
    print("=" * 50)
    
    # Check credentials
    if not ACCESS_TOKEN:
        print("❌ ERROR: INSTAGRAM_ACCESS_TOKEN not found in .env")
        return
    
    if not IG_USER_ID:
        print("❌ ERROR: INSTAGRAM_USER_ID not found in .env")
        return
    
    print(f"✅ Access token found: {ACCESS_TOKEN[:20]}...")
    print(f"✅ Instagram User ID: {IG_USER_ID}")
    print(f"✅ Image URL: {TEST_IMAGE_URL}")
    print(f"✅ Caption: {TEST_CAPTION[:50]}...")
    print()
    print("Posting to Instagram...")
    print()
    
    result = await post_to_instagram(
        image_url=TEST_IMAGE_URL,
        caption=TEST_CAPTION,
        access_token=ACCESS_TOKEN,
        ig_user_id=IG_USER_ID
    )
    
    print("RESULT:")
    print(result)
    
    if result.get("success"):
        print()
        print("✅ PHASE 6 COMPLETE! Posted to Instagram successfully!")
        print(f"View post: {result.get('instagram_post_url')}")
    else:
        print()
        print("❌ Posting failed.")
        print(f"Error: {result.get('message')}")

if __name__ == "__main__":
    asyncio.run(test())