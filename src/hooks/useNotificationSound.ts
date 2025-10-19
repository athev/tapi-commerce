import { useEffect, useRef, useState } from 'react';

type SoundType = 'high' | 'normal' | 'low';

// Generate simple notification beeps using Web Audio API
const generateBeep = (frequency: number, duration: number, volume: number = 0.3): Promise<void> => {
  return new Promise((resolve) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);

    setTimeout(() => {
      audioContext.close();
      resolve();
    }, duration * 1000);
  });
};

export const useNotificationSound = () => {
  const [isSoundEnabled, setIsSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('notification-sound-enabled');
    return saved !== 'false'; // Default: enabled
  });

  useEffect(() => {
    localStorage.setItem('notification-sound-enabled', String(isSoundEnabled));
  }, [isSoundEnabled]);

  const playSound = async (type: SoundType = 'normal') => {
    if (!isSoundEnabled) return;
    
    try {
      // Different frequencies and patterns for different priorities
      switch (type) {
        case 'high':
          // High priority: Two quick beeps
          await generateBeep(800, 0.15, 0.4);
          await new Promise(resolve => setTimeout(resolve, 100));
          await generateBeep(1000, 0.15, 0.4);
          break;
        case 'low':
          // Low priority: Soft single beep
          await generateBeep(400, 0.2, 0.2);
          break;
        case 'normal':
        default:
          // Normal: Single medium beep
          await generateBeep(600, 0.2, 0.3);
          break;
      }
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
  };

  const toggleSound = () => setIsSoundEnabled(prev => !prev);

  return { playSound, isSoundEnabled, toggleSound };
};
