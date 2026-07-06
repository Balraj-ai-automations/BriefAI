'use client';
import React from 'react';
import styles from './Textarea.module.css';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  errorText?: string;
}

export function Textarea({ label, helperText, errorText, id, className = '', ...rest }: TextareaProps) {
  const elId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className={styles.wrapper}>
      {label && <label className={styles.label} htmlFor={elId}>{label}</label>}
      <textarea
        id={elId}
        className={[styles.textarea, errorText ? styles.error : '', className].filter(Boolean).join(' ')}
        aria-describedby={errorText ? `${elId}-error` : helperText ? `${elId}-helper` : undefined}
        aria-invalid={!!errorText}
        {...rest}
      />
      {errorText && <span id={`${elId}-error`} className={styles.errorText} role="alert">{errorText}</span>}
      {!errorText && helperText && <span id={`${elId}-helper`} className={styles.helper}>{helperText}</span>}
    </div>
  );
}
