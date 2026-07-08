'use client';
import { useEffect, useState } from 'react';
import { getCurrentUserId } from './anonymousAuth';

/**
 * Resolves the current authenticated user's UUID on mount. A session
 * should already exist by the time any page uses this (bootstrapped in
 * /demo or the / startup router), so this just reads it back.
 */
export function useUserId() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getCurrentUserId().then((id) => {
      if (mounted) {
        setUserId(id);
        setIsLoading(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  return { userId, isLoading };
}
