
"use client";

import { useState, useEffect } from 'react';

interface CountdownProps {
  targetDate: string;
}

const calculateTimeLeft = (targetDate: string) => {
  const difference = +new Date(targetDate) - +new Date();
  let timeLeft = {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  };

  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60)
    };
  }

  return timeLeft;
};

export function Countdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetDate));

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);

    return () => clearTimeout(timer);
  });

  const timerComponents = Object.entries(timeLeft).map(([interval, value]) => {
    if (value < 0) return null;
    return (
      <div key={interval} className="flex flex-col items-center">
        <span className="font-bold text-lg leading-none">{String(value).padStart(2, '0')}</span>
        <span className="text-xs uppercase">{interval}</span>
      </div>
    );
  });
  
  const hasTimeLeft = Object.values(timeLeft).some(val => val > 0);

  return (
    <div className="flex items-center gap-2 text-primary">
      {hasTimeLeft ? timerComponents.filter(i => i).reduce((prev, curr, index) => [
        ...prev,
        curr,
        index < timerComponents.length - 2 ? <span key={`sep-${index}`} className="font-bold text-lg">:</span> : null
      ], [] as (JSX.Element | null)[]) : <span>Deal has ended!</span>}
    </div>
  );
}
