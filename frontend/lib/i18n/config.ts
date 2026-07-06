import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// ── English ───────────────────────────────────────────────────────────────────
import enCommon from '@/locales/en/common.json';
import enOnboarding from '@/locales/en/onboarding.json';
import enCampaign from '@/locales/en/campaign.json';
import enHistory from '@/locales/en/history.json';
import enSettings from '@/locales/en/settings.json';
import enErrors from '@/locales/en/errors.json';

// ── Hindi ─────────────────────────────────────────────────────────────────────
import hiCommon from '@/locales/hi/common.json';
import hiOnboarding from '@/locales/hi/onboarding.json';
import hiCampaign from '@/locales/hi/campaign.json';
import hiHistory from '@/locales/hi/history.json';
import hiSettings from '@/locales/hi/settings.json';
import hiErrors from '@/locales/hi/errors.json';

// ── Kannada ───────────────────────────────────────────────────────────────────
import knCommon from '@/locales/kn/common.json';
import knOnboarding from '@/locales/kn/onboarding.json';
import knCampaign from '@/locales/kn/campaign.json';
import knHistory from '@/locales/kn/history.json';
import knSettings from '@/locales/kn/settings.json';
import knErrors from '@/locales/kn/errors.json';

// ── Tamil ─────────────────────────────────────────────────────────────────────
import taCommon from '@/locales/ta/common.json';
import taOnboarding from '@/locales/ta/onboarding.json';
import taCampaign from '@/locales/ta/campaign.json';
import taHistory from '@/locales/ta/history.json';
import taSettings from '@/locales/ta/settings.json';
import taErrors from '@/locales/ta/errors.json';

// ── Telugu ────────────────────────────────────────────────────────────────────
import teCommon from '@/locales/te/common.json';
import teOnboarding from '@/locales/te/onboarding.json';
import teCampaign from '@/locales/te/campaign.json';
import teHistory from '@/locales/te/history.json';
import teSettings from '@/locales/te/settings.json';
import teErrors from '@/locales/te/errors.json';

// ── Marathi ───────────────────────────────────────────────────────────────────
import mrCommon from '@/locales/mr/common.json';
import mrOnboarding from '@/locales/mr/onboarding.json';
import mrCampaign from '@/locales/mr/campaign.json';
import mrHistory from '@/locales/mr/history.json';
import mrSettings from '@/locales/mr/settings.json';
import mrErrors from '@/locales/mr/errors.json';

const resources = {
  en: { common: enCommon, onboarding: enOnboarding, campaign: enCampaign, history: enHistory, settings: enSettings, errors: enErrors },
  hi: { common: hiCommon, onboarding: hiOnboarding, campaign: hiCampaign, history: hiHistory, settings: hiSettings, errors: hiErrors },
  kn: { common: knCommon, onboarding: knOnboarding, campaign: knCampaign, history: knHistory, settings: knSettings, errors: knErrors },
  ta: { common: taCommon, onboarding: taOnboarding, campaign: taCampaign, history: taHistory, settings: taSettings, errors: taErrors },
  te: { common: teCommon, onboarding: teOnboarding, campaign: teCampaign, history: teHistory, settings: teSettings, errors: teErrors },
  mr: { common: mrCommon, onboarding: mrOnboarding, campaign: mrCampaign, history: mrHistory, settings: mrSettings, errors: mrErrors },
};

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    ns: ['common', 'onboarding', 'campaign', 'history', 'settings', 'errors'],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
}

export default i18n;
