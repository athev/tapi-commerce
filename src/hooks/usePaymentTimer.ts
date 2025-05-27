
import { useState, useEffect } from 'react';

export const usePaymentTimer = (initialTime: number = 15 * 60) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [showManualButton, setShowManualButton] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setShowManualButton(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Show manual button after 5 minutes
    const manualButtonTimer = setTimeout(() => {
      setShowManualButton(true);
    }, 5 * 60 * 1000);

    return () => {
      clearInterval(timer);
      clearTimeout(manualButtonTimer);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return {
    timeLeft,
    showManualButton,
    formatTime
  };
};
