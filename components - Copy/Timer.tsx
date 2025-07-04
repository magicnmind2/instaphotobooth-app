import React, { useState, useEffect } from 'react';
import { ClockIcon } from './icons';

interface TimerProps {
  expiresAt: number;
  onExpire: () => void;
}

const formatTime = (seconds: number): string => {
  if (seconds < 0) return '00:00:00';
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
};

export const Timer: React.FC<TimerProps> = ({ expiresAt, onExpire }) => {
  const [remaining, setRemaining] = useState(expiresAt - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const newRemaining = expiresAt - Date.now();
      if (newRemaining <= 0) {
        setRemaining(0);
        onExpire();
        clearInterval(interval);
      } else {
        setRemaining(newRemaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const remainingSeconds = Math.round(remaining / 1000);
  const isEnding = remainingSeconds <= 60; // Less than or equal to 1 minute

  return (
    <div className={`absolute top-4 right-4 flex items-center gap-2 text-white font-bold py-2 px-4 rounded-full transition-colors ${isEnding ? 'bg-red-500/80 animate-pulse' : 'bg-black/50 backdrop-blur-sm'}`}>
      <ClockIcon className="w-5 h-5" />
      <span className="font-mono text-lg">{formatTime(remainingSeconds)}</span>
    </div>
  );
};
