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
    <div className="relative">
      <div className="flex items-center gap-3 bg-white rounded-lg px-4 py-2 shadow-lg">
        <span className="text-xs font-medium text-destructive uppercase tracking-wide">
          Kết thúc trong
        </span>
        <div className="flex gap-1 items-center">
          {/* Hours */}
          <div className="flex flex-col items-center">
            <div className="bg-gradient-to-br from-destructive to-destructive/80 text-white font-bold px-3 py-2 rounded text-lg min-w-[3rem] text-center animate-pulse-glow">
              {formatNumber(timeLeft.hours)}
            </div>
            <div className="text-[10px] text-muted-foreground text-center mt-1">
              Giờ
            </div>
          </div>
          <span className="text-2xl font-bold text-destructive self-start mt-1">:</span>
          
          {/* Minutes */}
          <div className="flex flex-col items-center">
            <div className="bg-gradient-to-br from-destructive to-destructive/80 text-white font-bold px-3 py-2 rounded text-lg min-w-[3rem] text-center animate-pulse-glow">
              {formatNumber(timeLeft.minutes)}
            </div>
            <div className="text-[10px] text-muted-foreground text-center mt-1">
              Phút
            </div>
          </div>
          <span className="text-2xl font-bold text-destructive self-start mt-1">:</span>
          
          {/* Seconds */}
          <div className="flex flex-col items-center">
            <div className="bg-gradient-to-br from-destructive to-destructive/80 text-white font-bold px-3 py-2 rounded text-lg min-w-[3rem] text-center animate-pulse-glow">
              {formatNumber(timeLeft.seconds)}
            </div>
            <div className="text-[10px] text-muted-foreground text-center mt-1">
              Giây
            </div>
          </div>
        </div>
      </div>
      
      {/* Pulsing glow effect */}
      <div className="absolute inset-0 bg-destructive/20 rounded-lg blur-xl animate-pulse -z-10" />
    </div>
  );
};

export default CountdownTimer;
