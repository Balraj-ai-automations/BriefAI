import React from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: React.ReactNode;
  clickable?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Card({ children, clickable, onClick, className = '' }: CardProps) {
  const classes = [styles.card, clickable ? styles.clickable : '', className].filter(Boolean).join(' ');
  if (clickable && onClick) {
    return (
      <div className={classes} onClick={onClick} role="button" tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onClick?.()}>
        {children}
      </div>
    );
  }
  return <div className={classes}>{children}</div>;
}
