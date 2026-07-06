from services.flux import generate_image

image_bytes = generate_image(
    prompt=(
        "Luxury handmade cotton kurti displayed on a mannequin, "
        "premium studio lighting, photorealistic, "
        "Instagram advertisement"
    )
)

print(type(image_bytes))
print(len(image_bytes))

with open("test_flux.jpg", "wb") as f:
    f.write(image_bytes)

print("Done")