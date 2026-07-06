print("Step 1: File started")

from services.mistral import mistral_service

print("Step 2: Import successful")


def main():
    print("Step 3: Inside main")

    prompt = """
    Write a short WhatsApp marketing message
    for a handmade kurti business in India.
    Keep it friendly and under 50 words.
    """

    print("Step 4: Calling generate()")

    response = mistral_service.generate(prompt)

    print("Step 5: Response received")

    print("\n===== AI RESPONSE =====\n")
    print(response)


if __name__ == "__main__":
    print("Step 6: Running main")
    main()