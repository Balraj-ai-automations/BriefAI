'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useCampaignStore } from '@/stores/campaign-store';
import { useAppStore } from '@/stores/app-store';

import { CAMPAIGN_QUESTIONS } from '@/features/campaign/questions.config';
import { Button } from '@/components/ui/Button';
import { QuestionProgress } from '@/components/campaign/QuestionProgress';
import { CampaignQuestion } from '@/components/campaign/CampaignQuestion';
import { LanguageSelector } from '@/components/campaign/LanguageSelector';
import { CampaignReview } from '@/components/campaign/CampaignReview';
import { SUPPORTED_LANGUAGES } from '@/features/campaign/questions.config';
import styles from './page.module.css';

const TOTAL_Q = CAMPAIGN_QUESTIONS.length; // 10

type FlowStep = 'question' | 'outputLanguage' | 'review';

export default function NewCampaignPage() {
  const { t } = useTranslation(['campaign', 'common']);
  const router = useRouter();
  const {
    currentQuestion, answers, whatsappLanguage, instagramLanguage,
    setAnswer, setCurrentQuestion, setWhatsappLanguage, setInstagramLanguage,
    hasDraft,
  } = useCampaignStore();
  const { appLanguage } = useAppStore();

  const [step, setStep] = useState<FlowStep>('question');
  const [fieldError, setFieldError] = useState('');
  const [draftNotice, setDraftNotice] = useState(false);

  // Runs once after the persisted campaign-store draft has hydrated on the
  // client — deferring to an effect (rather than a lazy useState initializer)
  // avoids a server/client render mismatch, since the server always sees an
  // empty draft.
  /* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
  useEffect(() => {
    if (hasDraft() && currentQuestion > 0) {
      setDraftNotice(true);
    } else if (!hasDraft() && appLanguage) {
      // Fresh draft — default WhatsApp output language to the app language.
      setWhatsappLanguage(appLanguage);
    }
  }, []);
  /* eslint-enable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */

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

  function handleCreate() {
    router.push('/generating');
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
          <LanguageSelector
            label={t('campaign:outputLanguage.whatsapp')}
            value={whatsappLanguage}
            onChange={setWhatsappLanguage}
          />
          <LanguageSelector
            label={t('campaign:outputLanguage.instagram')}
            value={instagramLanguage}
            onChange={setInstagramLanguage}
          />
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
          <CampaignReview
            rows={[
              { label: t('campaign:review.product'), value: answers.product },
              { label: t('campaign:review.price'), value: answers.price },
              { label: t('campaign:review.goal'), value: goalLabel },
              { label: t('campaign:review.whatsappLang'), value: wLang },
              { label: t('campaign:review.instagramLang'), value: iLang },
            ]}
          />
        </div>
        <div className={styles.stickyFooter}>
          <Button variant="ghost" onClick={() => setStep('question')}>{t('campaign:review.editAnswers')}</Button>
          <Button fullWidth size="lg" onClick={handleCreate}>
            {t('campaign:review.createCampaign')}
          </Button>
        </div>
      </div>
    );
  }

  // Question step
  return (
    <div className={styles.page}>
      <QuestionProgress
        current={currentQuestion + 1}
        total={TOTAL_Q}
        label={t('campaign:new.progress', { current: currentQuestion + 1, total: TOTAL_Q })}
        onBack={handleBack}
        backLabel={t('common:actions.back')}
      />

      {draftNotice && (
        <div className={styles.draftNotice}>
          <span>{t('campaign:new.draftRestored')}</span>
          <button onClick={() => setDraftNotice(false)}>×</button>
        </div>
      )}

      <div className={styles.body}>
        <CampaignQuestion
          question={question}
          value={currentAnswer as string}
          errorText={fieldError}
          onChange={handleAnswer}
        />
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
