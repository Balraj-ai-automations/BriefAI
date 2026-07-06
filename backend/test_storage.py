from services.flux import generate_image
from services.image_storage import save_image_bytes

image_bytes = generate_image(
    "Luxury handmade cotton kurti, premium studio lighting, photorealistic"
)

url = save_image_bytes(image_bytes)

print(url)