from services.supabase_client import supabase

response = supabase.table("campaigns").select("*").limit(1).execute()

print("Supabase connected successfully!")
print(response.data)