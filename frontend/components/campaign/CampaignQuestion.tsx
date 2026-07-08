'use client';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { ChoiceCard } from '@/components/ui/ChoiceCard';
import { PhotoUploader } from './PhotoUploader';
import type { QuestionConfig } from '@/features/campaign/questions.config';
import styles from './CampaignQuestion.module.css';

interface CampaignQuestionProps {
  question: QuestionConfig;
  value: string;
  errorText: string;
  onChange: (value: string) => void;
}

export function CampaignQuestion({ question, value, errorText, onChange }: CampaignQuestionProps) {
  const { t } = useTranslation('campaign');
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    // Text/textarea questions already move focus into their input via
    // autoFocus. Choice/photo questions have no input to focus, so move
    // focus to the heading instead (spec Section 88: announce progress).
    if (question.inputType === 'choice' || question.inputType === 'photo') {
      headingRef.current?.focus();
    }
  }, [question.id, question.inputType]);

  return (
    <div className={styles.wrap}>
      <h1 ref={headingRef} tabIndex={-1} className={styles.qTitle}>{t(question.titleKey)}</h1>
      {question.helperKey && <p className={styles.qHelper}>{t(question.helperKey)}</p>}

      {question.inputType === 'text' && (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholderKey ? t(question.placeholderKey) : ''}
          errorText={errorText}
          autoFocus
          inputMode="text"
        />
      )}

      {question.inputType === 'textarea' && (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholderKey ? t(question.placeholderKey) : ''}
          errorText={errorText}
          autoFocus
        />
      )}

      {question.inputType === 'choice' && question.options && (
        <div className={styles.choiceGrid} role="radiogroup">
          {question.options.map((opt) => (
            <ChoiceCard
              key={opt.value}
              value={opt.value}
              label={t(opt.labelKey)}
              selected={value === opt.value}
              onSelect={onChange}
            />
          ))}
        </div>
      )}

      {question.inputType === 'photo' && (
        <PhotoUploader
          message={t('campaign:questions.photo.unavailable')}
          helper={t('campaign:questions.photo.unavailableHelper')}
        />
      )}
    </div>
  );
}
