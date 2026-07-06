"""
Supabase Storage service for generated images.
"""

import logging
from uuid import uuid4

from services.supabase_client import supabase

logger = logging.getLogger(__name__)

BUCKET_NAME = "images"


def save_image_bytes(image_bytes: bytes) -> str:
    """
    Upload image bytes to Supabase Storage and return the public URL.
    """

    filename = f"campaigns/{uuid4()}.jpg"

    try:
        supabase.storage.from_(BUCKET_NAME).upload(
            path=filename,
            file=image_bytes,
            file_options={
                "content-type": "image/jpeg",
                "upsert": False,
            },
        )

        logger.info("Image uploaded successfully: %s", filename)

        return get_public_url(filename)

    except Exception as e:
        logger.exception("Failed to upload image")
        raise RuntimeError(f"Image upload failed: {e}")


def get_public_url(path: str) -> str:
    """
    Return the permanent public URL for a stored image.
    """

    return (
        supabase.storage
        .from_(BUCKET_NAME)
        .get_public_url(path)
    )