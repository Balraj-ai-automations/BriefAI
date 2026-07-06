'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useCampaignStore } from '@/stores/campaign-store';
import { useAppStore } from '@/stores/app-store';
import { getCurrentUserId } from '@/features/auth/anonymousAuth';

import { CAMPAIGN_QUESTIONS, SUPPORTED_LANGUAGES } from '@/features/campaign/questions.config';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { ChoiceCard } from '@/components/ui/ChoiceCard';
import { Modal } from '@/components/ui/Modal';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { SupportedLanguage } from '@/lib/api/types';
import styles from './page.module.css';

const TOTAL_Q = CAMPAIGN_QUESTIONS.length; // 10

type FlowStep = 'question' | 'outputLanguage' | 'review';

export default function NewCampaignPage() {
  const { t } = useTranslation(['campaign', 'common']);
  const router = useRouter();
  const {
    currentQuestion, answers, whatsappLanguage, instagramLanguage,
    setAnswer, setCurrentQuestion, setWhatsappLanguage, setInstagramLanguage,
    resetDraft, hasDraft,
  } = useCampaignStore();
  const { appLanguage } = useAppStore();

  const [step, setStep] = useState<FlowStep>('question');
  const [fieldError, setFieldError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [showStartNewModal, setShowStartNewModal] = useState(false);
  const [draftNotice, setDraftNotice] = useState(false);

  useEffect(() => {
    if (hasDraft() && currentQuestion > 0) setDraftNotice(true);
  }, []); // eslint-disable-line

  const question = CAMPAIGN_QUESTIONS[currentQuestion];
  const currentAnswer = answers[question?.id as keyof typeof answers] ?? '';

  function handleAnswer(v: string) {
    if (!question) return;
    setAnswer(question.id as keyof typeof answers, v);
    setFieldError('');
  }

  function handleNext() {
    if (!question) return;
    const err = question.validate(currentAnswer as string);
    if (err && question.required) { setFieldError(t(err)); return; }
    setFieldError('');
    if (currentQuestion < TOTAL_Q - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setStep('outputLanguage');
    }
  }

  function handleBack() {
    if (step === 'review') { setStep('outputLanguage'); return; }
    if (step === 'outputLanguage') { setCurrentQuestion(TOTAL_Q - 1); setStep('question'); return; }
    if (currentQuestion === 0) { router.back(); return; }
    setCurrentQuestion(currentQuestion - 1);
    setFieldError('');
  }

  function handleSkip() {
    if (!question?.skipLabel) return;
    setAnswer(question.id as keyof typeof answers, '');
    setCurrentQuestion(currentQuestion + 1);
    if (currentQuestion >= TOTAL_Q - 1) setStep('outputLanguage');
  }

  async function handleCreate() {
    setIsCreating(true);
    setCreateError('');
    try {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error('Not authenticated');
      const payload = {
        answers,
        whatsapp_language: whatsappLanguage,
        instagram_language: instagramLanguage,
        user_id: userId,
      };
      sessionStorage.setItem('briefai:pendingCampaign', JSON.stringify(payload));
      router.push('/generating');
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed');
      setIsCreating(false);
    }
  }

  if (step === 'outputLanguage') {
    return (
      <div className={styles.page}>
        <div className={styles.topBar}>
          <button className={styles.backBtn} onClick={handleBack}>←</button>
        </div>
        <div className={styles.body}>
          <h1 className={styles.qTitle}>{t('campaign:outputLanguage.heading')}</h1>
          <p className={styles.qHelper}>{t('campaign:outputLanguage.subheading')}</p>
          <div className={styles.langSection}>
            <p className={styles.langLabel}>{t('campaign:outputLanguage.whatsapp')}</p>
            <div className={styles.choiceGrid}>
              {SUPPORTED_LANGUAGES.map(l => (
                <ChoiceCard key={l.code} value={l.code} label={l.nativeName}
                  selected={whatsappLanguage === l.code} onSelect={(v) => setWhatsappLanguage(v as SupportedLanguage)} />
              ))}
            </div>
          </div>
          <div className={styles.langSection}>
            <p className={styles.langLabel}>{t('campaign:outputLanguage.instagram')}</p>
            <div className={styles.choiceGrid}>
              {SUPPORTED_LANGUAGES.map(l => (
                <ChoiceCard key={l.code} value={l.code} label={l.nativeName}
                  selected={instagramLanguage === l.code} onSelect={(v) => setInstagramLanguage(v as SupportedLanguage)} />
              ))}
            </div>
          </div>
        </div>
        <div className={styles.stickyFooter}>
          <Button fullWidth size="lg" onClick={() => setStep('review')}>{t('common:actions.continue')}</Button>
        </div>
      </div>
    );
  }

  if (step === 'review') {
    const goalLabel = answers.goal ? t(`campaign:questions.goal.options.${answers.goal}`) : '—';
    const wLang = SUPPORTED_LANGUAGES.find(l => l.code === whatsappLanguage)?.nativeName ?? whatsappLanguage;
    const iLang = SUPPORTED_LANGUAGES.find(l => l.code === instagramLanguage)?.nativeName ?? instagramLanguage;
    return (
      <div className={styles.page}>
        <div className={styles.topBar}>
          <button className={styles.backBtn} onClick={handleBack}>←</button>
        </div>
        <div className={styles.body}>
          <h1 className={styles.qTitle}>{t('campaign:review.heading')}</h1>
          <div className={styles.reviewCard}>
            {[
              { label: t('campaign:review.product'), value: answers.product },
              { label: t('campaign:review.price'), value: answers.price },
              { label: t('campaign:review.goal'), value: goalLabel },
              { label: t('campaign:review.whatsappLang'), value: wLang },
              { label: t('campaign:review.instagramLang'), value: iLang },
            ].map(row => (
              <div key={row.label} className={styles.reviewRow}>
                <span className={styles.reviewLabel}>{row.label}</span>
                <span className={styles.reviewValue}>{row.value || '—'}</span>
              </div>
            ))}
          </div>
          {createError && <p className={styles.createError}>{createError}</p>}
        </div>
        <div className={styles.stickyFooter}>
          <Button variant="ghost" onClick={() => setStep('question')}>{t('campaign:review.editAnswers')}</Button>
          <Button fullWidth size="lg" loading={isCreating} onClick={handleCreate}>
            {isCreating ? t('campaign:review.creating') : t('campaign:review.createCampaign')}
          </Button>
        </div>
      </div>
    );
  }

  // Question step
  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={handleBack} aria-label="Go back">←</button>
        <div className={styles.progressWrap}>
          <ProgressBar current={currentQuestion + 1} total={TOTAL_Q}
            label={t('campaign:new.progress', { current: currentQuestion + 1, total: TOTAL_Q })} />
        </div>
      </div>

      {draftNotice && (
        <div className={styles.draftNotice}>
          <span>{t('campaign:new.draftRestored')}</span>
          <button onClick={() => setDraftNotice(false)}>×</button>
        </div>
      )}

      <div className={styles.body}>
        <h1 className={styles.qTitle}>{t(question.titleKey)}</h1>
        {question.helperKey && <p className={styles.qHelper}>{t(question.helperKey)}</p>}

        {question.inputType === 'text' && (
          <Input
            value={currentAnswer as string}
            onChange={(e) => handleAnswer(e.target.value)}
            placeholder={question.placeholderKey ? t(question.placeholderKey) : ''}
            errorText={fieldError}
            autoFocus
            inputMode="text"
          />
        )}

        {question.inputType === 'textarea' && (
          <Textarea
            value={currentAnswer as string}
            onChange={(e) => handleAnswer(e.target.value)}
            placeholder={question.placeholderKey ? t(question.placeholderKey) : ''}
            errorText={fieldError}
            autoFocus
          />
        )}

        {question.inputType === 'choice' && question.options && (
          <div className={styles.choiceGrid} role="radiogroup">
            {question.options.map(opt => (
              <ChoiceCard
                key={opt.value}
                value={opt.value}
                label={t(opt.labelKey)}
                selected={currentAnswer === opt.value}
                onSelect={handleAnswer}
              />
            ))}
          </div>
        )}

        {question.inputType === 'photo' && (
          <div className={styles.photoPlaceholder}>
            <p className={styles.photoMsg}>{t('campaign:questions.photo.unavailable')}</p>
            <p className={styles.photoHelper}>{t('campaign:questions.photo.unavailableHelper')}</p>
          </div>
        )}
      </div>

      <div className={styles.stickyFooter}>
        {question.skipLabel && !question.required && (
          <Button variant="ghost" onClick={handleSkip}>{t(question.skipLabel)}</Button>
        )}
        <Button fullWidth size="lg" onClick={handleNext}>{t('common:actions.continue')}</Button>
      </div>
    </div>
  );
}
