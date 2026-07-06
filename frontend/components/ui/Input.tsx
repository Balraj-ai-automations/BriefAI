'use client';
import React from 'react';
import styles from './Input.module.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  errorText?: string;
}

export function Input({ label, helperText, errorText, id, className = '', ...rest }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className={styles.wrapper}>
      {label && <label className={styles.label} htmlFor={inputId}>{label}</label>}
      <input
        id={inputId}
        className={[styles.input, errorText ? styles.error : '', className].filter(Boolean).join(' ')}
        aria-describedby={errorText ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
        aria-invalid={!!errorText}
        {...rest}
      />
      {errorText && <span id={`${inputId}-error`} className={styles.errorText} role="alert">{errorText}</span>}
      {!errorText && helperText && <span id={`${inputId}-helper`} className={styles.helper}>{helperText}</span>}
    </div>
  );
}
