"""
Shared Supabase client for BriefAI.

This module creates a single Supabase client instance
that can be imported and reused throughout the project.
"""

import os

from dotenv import load_dotenv
from supabase import Client, create_client

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL:
    raise ValueError("SUPABASE_URL is not set.")

if not SUPABASE_KEY:
    raise ValueError("SUPABASE_KEY is not set.")

# Shared client instance
supabase: Client = create_client(
    SUPABASE_URL,
    SUPABASE_KEY,
)