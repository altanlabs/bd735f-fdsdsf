import React, { useState, useEffect } from 'react';

export const DigitalClock: React.FC = () => {
  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 100); // Update every 100ms for smooth tenths display

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number): string => {
    return num.toString().padStart(2, '0');
  };

  const hours = formatNumber(time.getHours());
  const minutes = formatNumber(time.getMinutes());
  const seconds = formatNumber(time.getSeconds());
  const tenths = Math.floor(time.getMilliseconds() / 100); // Get tenths of a second

  return (
    <div className="flex items-center justify-center bg-black/5 dark:bg-white/5 backdrop-blur-sm rounded-lg px-4 py-2 font-mono text-lg">
      <div className="grid grid-flow-col gap-1 text-primary font-bold">
        <div className="flex items-center">
          <span className="w-[2ch] tabular-nums">{hours}</span>
          <span className="animate-pulse">:</span>
        </div>
        <div className="flex items-center">
          <span className="w-[2ch] tabular-nums">{minutes}</span>
          <span className="animate-pulse">:</span>
        </div>
        <div className="flex items-center">
          <span className="w-[2ch] tabular-nums">{seconds}</span>
          <span className="text-primary/50">.</span>
          <span className="w-[1ch] tabular-nums text-primary/50">{tenths}</span>
        </div>
      </div>
    </div>
  );
};