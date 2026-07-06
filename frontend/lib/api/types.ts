// ─── API Types ─────────────────────────────────────────────────────────────────
// Exactly matches the verified backend contracts from spec Sections 70-73.
// Do not add fields that don't exist in the backend.

export type SupportedLanguage = 'en' | 'hi' | 'kn' | 'ta' | 'te' | 'mr';

// ── Generate Campaign ─────────────────────────────────────────────────────────

export interface GenerateCampaignRequest {
  user_id: string;
  name: string;
  product: string;
  usp: string;
  price: string;
  offer: string | null;
  buyer: string;
  location: string;
  occasion: string;
  goal: string;
  app_language: SupportedLanguage;
  ig_language: SupportedLanguage;
  wa_language: SupportedLanguage;
  has_product_image: boolean;
  product_image_base64: string | null;
}

export interface GenerateCampaignResponse {
  campaign_id: string | null; // Nullable — save may fail after generation
  whatsapp_copy: string;
  instagram_caption: string;
  image_url: string | null;
  tone: string;           // Not shown in MVP result UI
  campaign_angle: string; // Not shown in MVP result UI
}

// ── Campaign (History item) ───────────────────────────────────────────────────

export interface Campaign {
  id: string;
  user_id: string;
  product: string;
  usp: string;
  price: string;
  offer: string | null;
  goal: string;
  occasion: string;
  buyer: string;
  location: string;
  app_language: SupportedLanguage;
  ig_language: SupportedLanguage;
  wa_language: SupportedLanguage;
  whatsapp_copy: string;
  instagram_caption: string;
  image_url: string | null;
  image_prompt: string | null;
  posted_to_instagram: boolean;
  posted_at: string | null;
  created_at: string;
}

export interface HistoryResponse {
  campaigns: Campaign[];
  count: number;
}

// ── Health ────────────────────────────────────────────────────────────────────

export interface HealthResponse {
  status: 'ok';
}

// ── Campaign Draft (frontend state) ──────────────────────────────────────────

export interface CampaignAnswers {
  name?: string;
  product?: string;
  usp?: string;
  price?: string;
  offer?: string;
  buyer?: string;
  location?: string;
  occasion?: string;
  goal?: string;
  has_product_image?: boolean;
}

export interface CampaignDraft {
  currentQuestion: number; // 0-indexed, 0-9
  answers: CampaignAnswers;
  whatsappLanguage: SupportedLanguage;
  instagramLanguage: SupportedLanguage;
  appLanguage: SupportedLanguage;
  updatedAt: string;
  version: number;
}
