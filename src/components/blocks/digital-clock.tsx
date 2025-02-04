import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';

export function DigitalClock() {
  const [time, setTime] = useState({
    hours: '00',
    minutes: '00',
    seconds: '00',
    tenths: '0'
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime({
        hours: String(now.getHours()).padStart(2, '0'),
        minutes: String(now.getMinutes()).padStart(2, '0'),
        seconds: String(now.getSeconds()).padStart(2, '0'),
        tenths: String(Math.floor(now.getMilliseconds() / 100))
      });
    }, 100); // Update every 100ms for tenths

    return () => clearInterval(timer);
  }, []);

  return (
    <Card className="inline-flex items-center gap-1 px-4 py-2 font-mono text-2xl font-bold bg-primary text-primary-foreground">
      <span>{time.hours}</span>
      <span className="animate-pulse">:</span>
      <span>{time.minutes}</span>
      <span className="animate-pulse">:</span>
      <span>{time.seconds}</span>
      <span className="text-primary-foreground/80">.</span>
      <span className="text-primary-foreground/80">{time.tenths}</span>
    </Card>
  );
}