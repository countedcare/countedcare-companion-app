import { useEffect, useRef } from 'react';

const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds

interface UseAutoLogoutProps {
  user: any;
  signOut: () => Promise<void>;
}

export const useAutoLogout = ({ user, signOut }: UseAutoLogoutProps) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user) return;

    const resetTimer = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        console.log('Auto-logout: User inactive for 10 minutes');
        signOut();
      }, INACTIVITY_TIMEOUT);
    };

    // Events that indicate user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    // Set up event listeners
    events.forEach(event => {
      document.addEventListener(event, resetTimer);
    });

    // Initialize timer
    resetTimer();

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [user, signOut]);
};
