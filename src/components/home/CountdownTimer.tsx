import { useState, useEffect } from "react";

interface CountdownTimerProps {
  endTime: Date;
}

const CountdownTimer = ({ endTime }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = endTime.getTime() - Date.now();

      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  const formatNumber = (num: number) => String(num).padStart(2, "0");

  return (
    <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1.5">
      <span className="text-xs text-white font-medium">Kết thúc trong</span>
      <div className="flex items-center gap-0.5">
        <span className="bg-white text-destructive font-bold text-sm px-2 py-1 rounded min-w-[2rem] text-center">
          {formatNumber(timeLeft.hours)}
        </span>
        <span className="text-white font-bold">:</span>
        <span className="bg-white text-destructive font-bold text-sm px-2 py-1 rounded min-w-[2rem] text-center">
          {formatNumber(timeLeft.minutes)}
        </span>
        <span className="text-white font-bold">:</span>
        <span className="bg-white text-destructive font-bold text-sm px-2 py-1 rounded min-w-[2rem] text-center">
          {formatNumber(timeLeft.seconds)}
        </span>
      </div>
    </div>
  );
};

export default CountdownTimer;
