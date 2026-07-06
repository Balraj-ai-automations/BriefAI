import { z } from 'zod';
import type { SupportedLanguage } from '@/lib/api/types';

// ── Per-question validation schemas ───────────────────────────────────────────

export const nameSchema = z
  .string()
  .min(2, 'validation.name.tooShort')
  .max(50, 'validation.name.tooLong');

export const productSchema = z
  .string()
  .min(3, 'validation.product.tooShort')
  .max(120, 'validation.product.tooLong');

export const uspSchema = z
  .string()
  .min(3, 'validation.usp.tooShort')
  .max(500, 'validation.usp.tooLong');

export const priceSchema = z
  .string()
  .min(1, 'validation.price.required')
  .max(100, 'validation.price.tooLong');

export const offerSchema = z
  .string()
  .max(300, 'validation.offer.tooLong')
  .optional()
  .or(z.literal(''));

export const buyerSchema = z
  .string()
  .min(3, 'validation.buyer.tooShort')
  .max(500, 'validation.buyer.tooLong');

export const locationSchema = z
  .string()
  .min(2, 'validation.location.tooShort')
  .max(120, 'validation.location.tooLong');

export const occasionSchema = z.string().min(1, 'validation.occasion.required');
export const goalSchema = z.string().min(1, 'validation.goal.required');

// ── Question option definitions ───────────────────────────────────────────────

export const OCCASION_OPTIONS = [
  'none',
  'diwali',
  'eid',
  'christmas',
  'pongal',
  'holi',
  'new_year',
  'summer',
  'monsoon',
  'wedding',
  'other',
] as const;

export const GOAL_OPTIONS = [
  'attract_customers',
  'promote_offer',
  'build_trust',
  'announce_launch',
  'increase_orders',
  'grow_followers',
] as const;

// ── Question configuration ─────────────────────────────────────────────────────

export type QuestionInputType = 'text' | 'textarea' | 'choice' | 'photo';

export interface QuestionOption {
  value: string;
  labelKey: string; // i18n key relative to campaign namespace
}

export interface QuestionConfig {
  index: number;
  id: keyof import('@/lib/api/types').CampaignAnswers;
  titleKey: string;
  helperKey?: string;
  placeholderKey?: string;
  inputType: QuestionInputType;
  required: boolean;
  validate: (value: string) => string | null; // returns error key or null
  options?: QuestionOption[];
  skipLabel?: string; // For optional questions like offer
}

function makeValidator(schema: z.ZodSchema): (v: string) => string | null {
  return (v: string) => {
    const result = schema.safeParse(v.trim());
    if (result.success) return null;
    return result.error.issues[0]?.message ?? 'errors.unknown';
  };
}

export const CAMPAIGN_QUESTIONS: QuestionConfig[] = [
  {
    index: 0,
    id: 'name',
    titleKey: 'campaign:questions.name.title',
    helperKey: 'campaign:questions.name.helper',
    placeholderKey: 'campaign:questions.name.placeholder',
    inputType: 'text',
    required: true,
    validate: makeValidator(nameSchema),
  },
  {
    index: 1,
    id: 'product',
    titleKey: 'campaign:questions.product.title',
    helperKey: 'campaign:questions.product.helper',
    placeholderKey: 'campaign:questions.product.placeholder',
    inputType: 'textarea',
    required: true,
    validate: makeValidator(productSchema),
  },
  {
    index: 2,
    id: 'usp',
    titleKey: 'campaign:questions.usp.title',
    helperKey: 'campaign:questions.usp.helper',
    placeholderKey: 'campaign:questions.usp.placeholder',
    inputType: 'textarea',
    required: true,
    validate: makeValidator(uspSchema),
  },
  {
    index: 3,
    id: 'price',
    titleKey: 'campaign:questions.price.title',
    helperKey: 'campaign:questions.price.helper',
    placeholderKey: 'campaign:questions.price.placeholder',
    inputType: 'text',
    required: true,
    validate: makeValidator(priceSchema),
  },
  {
    index: 4,
    id: 'offer',
    titleKey: 'campaign:questions.offer.title',
    helperKey: 'campaign:questions.offer.helper',
    placeholderKey: 'campaign:questions.offer.placeholder',
    inputType: 'textarea',
    required: false,
    validate: makeValidator(offerSchema),
    skipLabel: 'campaign:questions.offer.skip',
  },
  {
    index: 5,
    id: 'buyer',
    titleKey: 'campaign:questions.buyer.title',
    helperKey: 'campaign:questions.buyer.helper',
    placeholderKey: 'campaign:questions.buyer.placeholder',
    inputType: 'textarea',
    required: true,
    validate: makeValidator(buyerSchema),
  },
  {
    index: 6,
    id: 'location',
    titleKey: 'campaign:questions.location.title',
    helperKey: 'campaign:questions.location.helper',
    placeholderKey: 'campaign:questions.location.placeholder',
    inputType: 'text',
    required: true,
    validate: makeValidator(locationSchema),
  },
  {
    index: 7,
    id: 'occasion',
    titleKey: 'campaign:questions.occasion.title',
    helperKey: 'campaign:questions.occasion.helper',
    inputType: 'choice',
    required: true,
    validate: makeValidator(occasionSchema),
    options: OCCASION_OPTIONS.map((v) => ({
      value: v,
      labelKey: `campaign:questions.occasion.options.${v}`,
    })),
  },
  {
    index: 8,
    id: 'goal',
    titleKey: 'campaign:questions.goal.title',
    helperKey: 'campaign:questions.goal.helper',
    inputType: 'choice',
    required: true,
    validate: makeValidator(goalSchema),
    options: GOAL_OPTIONS.map((v) => ({
      value: v,
      labelKey: `campaign:questions.goal.options.${v}`,
    })),
  },
  {
    index: 9,
    id: 'has_product_image',
    titleKey: 'campaign:questions.photo.title',
    helperKey: 'campaign:questions.photo.helper',
    inputType: 'photo',
    required: false,
    validate: () => null, // Always valid — photo is optional
  },
];

export const SUPPORTED_LANGUAGES: { code: SupportedLanguage; nameKey: string; nativeName: string }[] = [
  { code: 'en', nameKey: 'common:language.english', nativeName: 'English' },
  { code: 'hi', nameKey: 'common:language.hindi', nativeName: 'हिन्दी' },
  { code: 'kn', nameKey: 'common:language.kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ta', nameKey: 'common:language.tamil', nativeName: 'தமிழ்' },
  { code: 'te', nameKey: 'common:language.telugu', nativeName: 'తెలుగు' },
  { code: 'mr', nameKey: 'common:language.marathi', nativeName: 'मराठी' },
];
