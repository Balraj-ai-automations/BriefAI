"""
Instagram Business Login OAuth flow.

Endpoints:
    GET /api/auth/instagram/login
    GET /api/auth/instagram/callback
"""

import os
import logging
from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import RedirectResponse

from services.supabase_client import supabase_client


logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/auth",
    tags=["instagram"],
)


# ============================================================
# Configuration
# ============================================================

META_APP_ID = os.getenv("META_APP_ID")
META_APP_SECRET = os.getenv("META_APP_SECRET")
META_REDIRECT_URI = os.getenv("META_REDIRECT_URI")

FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:3000",
).rstrip("/")


# ============================================================
# Instagram Business Login endpoints
# ============================================================

INSTAGRAM_AUTH_URL = (
    "https://www.instagram.com/oauth/authorize"
)

INSTAGRAM_TOKEN_URL = (
    "https://api.instagram.com/oauth/access_token"
)

INSTAGRAM_LONG_LIVED_TOKEN_URL = (
    "https://graph.instagram.com/access_token"
)

INSTAGRAM_ME_URL = (
    "https://graph.instagram.com/me"
)


# ============================================================
# Startup configuration validation
# ============================================================

if not META_APP_ID:
    logger.warning("META_APP_ID is not configured.")

if not META_APP_SECRET:
    logger.warning("META_APP_SECRET is not configured.")

if not META_REDIRECT_URI:
    logger.warning("META_REDIRECT_URI is not configured.")


# ============================================================
# Instagram Login
# ============================================================

@router.get("/instagram/login")
async def instagram_login(user_id: str):
    """
    Start Instagram Business Login OAuth flow.

    Frontend calls:

    /api/auth/instagram/login?user_id=<USER_ID>
    """

    if not user_id:
        raise HTTPException(
            status_code=400,
            detail="user_id required",
        )

    if not META_APP_ID:
        raise HTTPException(
            status_code=500,
            detail="Instagram App ID is not configured.",
        )

    if not META_REDIRECT_URI:
        raise HTTPException(
            status_code=500,
            detail="Instagram redirect URI is not configured.",
        )

    # --------------------------------------------------------
    # MVP state
    # --------------------------------------------------------
    # For the current MVP we keep the existing user_id state
    # approach. Secure random OAuth state will be implemented
    # later during authentication hardening.
    # --------------------------------------------------------

    state = user_id

    auth_params = {
        "force_reauth": "true",
        "client_id": META_APP_ID,
        "redirect_uri": META_REDIRECT_URI,
        "response_type": "code",
        "scope": (
            "instagram_business_basic,"
            "instagram_business_content_publish"
        ),
        "state": state,
    }

    auth_url = (
        f"{INSTAGRAM_AUTH_URL}?"
        f"{urlencode(auth_params)}"
    )

    logger.info(
        "Starting Instagram OAuth for user %s",
        user_id,
    )

    return RedirectResponse(
        url=auth_url,
        status_code=302,
    )


# ============================================================
# Instagram OAuth Callback
# ============================================================

@router.get("/instagram/callback")
async def instagram_callback(
    code: str | None = Query(default=None),
    state: str | None = Query(default=None),
    error: str | None = Query(default=None),
    error_reason: str | None = Query(default=None),
    error_description: str | None = Query(default=None),
):
    """
    Instagram redirects the user here after authorization.
    """

    # --------------------------------------------------------
    # Handle Instagram authorization errors
    # --------------------------------------------------------

    if error:
        logger.error(
            "Instagram OAuth error: %s | reason=%s | description=%s",
            error,
            error_reason,
            error_description,
        )

        error_message = (
            error_description
            or error_reason
            or error
        )

        return RedirectResponse(
            url=(
                f"{FRONTEND_URL}"
                f"/settings"
                f"?instagram_error={error_message}"
            )
        )

    # --------------------------------------------------------
    # Validate callback parameters
    # --------------------------------------------------------

    if not code:
        logger.error(
            "Instagram callback missing authorization code."
        )

        return RedirectResponse(
            url=(
                f"{FRONTEND_URL}"
                "/settings?instagram_error=missing_code"
            )
        )

    if not state:
        logger.error(
            "Instagram callback missing state."
        )

        return RedirectResponse(
            url=(
                f"{FRONTEND_URL}"
                "/settings?instagram_error=missing_state"
            )
        )

    user_id = state

    # ========================================================
    # Token exchange
    # ========================================================

    try:

        async with httpx.AsyncClient(
            timeout=30.0
        ) as client:

            # ------------------------------------------------
            # Step 1:
            # Exchange authorization code for access token
            # ------------------------------------------------

            logger.info(
                "Exchanging Instagram authorization code."
            )

            token_response = await client.post(
                INSTAGRAM_TOKEN_URL,
                data={
                    "client_id": META_APP_ID,
                    "client_secret": META_APP_SECRET,
                    "grant_type": "authorization_code",
                    "redirect_uri": META_REDIRECT_URI,
                    "code": code,
                },
            )

            if token_response.status_code != 200:
                logger.error(
                    "Instagram token exchange failed: %s",
                    token_response.text,
                )

                raise Exception(
                    "Instagram token exchange failed."
                )

            token_data = token_response.json()

            short_lived_token = token_data.get(
                "access_token"
            )

            instagram_user_id = token_data.get(
                "user_id"
            )

            if not short_lived_token:
                raise Exception(
                    "Instagram did not return an access token."
                )

            # ------------------------------------------------
            # Step 2:
            # Exchange for long-lived token
            # ------------------------------------------------

            logger.info(
                "Requesting long-lived Instagram token."
            )

            long_token_response = await client.get(
                INSTAGRAM_LONG_LIVED_TOKEN_URL,
                params={
                    "grant_type": "ig_exchange_token",
                    "client_secret": META_APP_SECRET,
                    "access_token": short_lived_token,
                },
            )

            if long_token_response.status_code != 200:
                logger.error(
                    "Long-lived token exchange failed: %s",
                    long_token_response.text,
                )

                raise Exception(
                    "Instagram long-lived token exchange failed."
                )

            long_token_data = (
                long_token_response.json()
            )

            long_lived_token = long_token_data.get(
                "access_token"
            )

            if not long_lived_token:
                raise Exception(
                    "Instagram did not return a long-lived token."
                )

            # ------------------------------------------------
            # Step 3:
            # Get Instagram account information
            # ------------------------------------------------

            logger.info(
                "Fetching Instagram account information."
            )

            me_response = await client.get(
                INSTAGRAM_ME_URL,
                params={
                    "fields": "id,username",
                    "access_token": long_lived_token,
                },
            )

            if me_response.status_code != 200:
                logger.error(
                    "Instagram user lookup failed: %s",
                    me_response.text,
                )

                raise Exception(
                    "Failed to retrieve Instagram account information."
                )

            me_data = me_response.json()

            instagram_id = me_data.get("id")
            instagram_handle = me_data.get("username")

            # ------------------------------------------------
            # Validate Instagram account information
            # ------------------------------------------------

            if not instagram_id:
                # Fallback to user_id returned during token exchange
                instagram_id = instagram_user_id

            if not instagram_id:
                raise Exception(
                    "Instagram user ID was not returned."
                )

            if not instagram_handle:
                raise Exception(
                    "Instagram username was not returned."
                )

        # ====================================================
        # Save Instagram connection
        # ====================================================

        logger.info(
            "Saving Instagram connection for user %s",
            user_id,
        )

        supabase_client.table(
            "instagram_connections"
        ).upsert(
            {
                "user_id": user_id,
                "instagram_id": instagram_id,
                "instagram_handle": instagram_handle,
                "access_token": long_lived_token,
            }
        ).execute()

        logger.info(
            "Instagram connection saved successfully for @%s",
            instagram_handle,
        )

        # ====================================================
        # Redirect frontend
        # ====================================================

        return RedirectResponse(
            url=(
                f"{FRONTEND_URL}"
                f"/dashboard"
                f"?instagram_connected=true"
                f"&handle={instagram_handle}"
            )
        )

    # ========================================================
    # Error handling
    # ========================================================

    except httpx.TimeoutException:

        logger.exception(
            "Instagram API request timed out."
        )

        return RedirectResponse(
            url=(
                f"{FRONTEND_URL}"
                "/settings"
                "?instagram_error=instagram_api_timeout"
            )
        )

    except Exception:

        logger.exception(
            "Instagram OAuth callback failed."
        )

        return RedirectResponse(
            url=(
                f"{FRONTEND_URL}"
                "/settings"
                "?instagram_error=instagram_connection_failed"
            )
        )