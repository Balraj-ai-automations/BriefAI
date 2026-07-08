'use client';
import styles from './PhotoUploader.module.css';

interface PhotoUploaderProps {
  message: string;
  helper: string;
}

// Product-photo upload is feature-flagged off (NEXT_PUBLIC_FEATURE_PRODUCT_PHOTO)
// until the backend actually processes the uploaded image — see spec Section 32.
// This is a disabled boundary, not a working uploader.
export function PhotoUploader({ message, helper }: PhotoUploaderProps) {
  return (
    <div className={styles.photoPlaceholder}>
      <p className={styles.photoMsg}>{message}</p>
      <p className={styles.photoHelper}>{helper}</p>
    </div>
  );
}
