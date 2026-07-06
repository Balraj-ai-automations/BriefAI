import type { CampaignDraft, GenerateCampaignRequest } from '@/lib/api/types';

// ─── Date helpers ────────────────────────────────────────────────────────────

export function formatDate(iso: string, locale: string = 'en-IN'): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

// ─── Clipboard ───────────────────────────────────────────────────────────────

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback for older browsers
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    return true;
  } catch {
    return false;
  }
}

// ─── Debounce ─────────────────────────────────────────────────────────────────

export function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

// ─── Draft → API request mapper ───────────────────────────────────────────────

export function mapDraftToGenerateRequest(
  draft: CampaignDraft,
  userId: string
): GenerateCampaignRequest {
  const a = draft.answers;
  return {
    user_id: userId,
    name: (a.name ?? '').trim(),
    product: (a.product ?? '').trim(),
    usp: (a.usp ?? '').trim(),
    price: (a.price ?? '').trim(),
    offer: (a.offer ?? '').trim() || null,
    buyer: (a.buyer ?? '').trim(),
    location: (a.location ?? '').trim(),
    occasion: (a.occasion ?? '').trim(),
    goal: (a.goal ?? '').trim(),
    app_language: draft.appLanguage,
    ig_language: draft.instagramLanguage,
    wa_language: draft.whatsappLanguage,
    has_product_image: false, // Feature flag off
    product_image_base64: null,
  };
}

// ─── String helpers ────────────────────────────────────────────────────────────

export function clsx(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + '…';
}
