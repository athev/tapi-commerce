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
      <div className="flex items-center gap-1.5 md:gap-3 bg-white rounded-md md:rounded-lg px-2 md:px-4 py-1 md:py-2 shadow-lg">
        <span className="text-[9px] md:text-xs font-medium text-destructive uppercase tracking-wide hidden md:inline">
          Kết thúc trong
        </span>
        <span className="text-[9px] md:hidden font-medium text-destructive">
          KT:
        </span>
        
        <div className="flex gap-0.5 md:gap-1">
          {/* Hours */}
          <div className="relative">
            <div className="bg-gradient-to-br from-destructive to-destructive/80 text-white font-bold px-1.5 md:px-3 py-1 md:py-2 rounded text-xs md:text-lg min-w-[1.5rem] md:min-w-[3rem] text-center">
              {formatNumber(timeLeft.hours)}
            </div>
            <div className="text-[8px] md:text-[10px] text-muted-foreground text-center mt-0.5 md:mt-1 hidden md:block">
              Giờ
            </div>
          </div>
          <span className="text-sm md:text-2xl font-bold text-destructive self-center">:</span>
          
          {/* Minutes */}
          <div className="relative">
            <div className="bg-gradient-to-br from-destructive to-destructive/80 text-white font-bold px-1.5 md:px-3 py-1 md:py-2 rounded text-xs md:text-lg min-w-[1.5rem] md:min-w-[3rem] text-center">
              {formatNumber(timeLeft.minutes)}
            </div>
            <div className="text-[8px] md:text-[10px] text-muted-foreground text-center mt-0.5 md:mt-1 hidden md:block">
              Phút
            </div>
          </div>
          <span className="text-sm md:text-2xl font-bold text-destructive self-center">:</span>
          
          {/* Seconds */}
          <div className="relative">
            <div className="bg-gradient-to-br from-destructive to-destructive/80 text-white font-bold px-1.5 md:px-3 py-1 md:py-2 rounded text-xs md:text-lg min-w-[1.5rem] md:min-w-[3rem] text-center">
              {formatNumber(timeLeft.seconds)}
            </div>
            <div className="text-[8px] md:text-[10px] text-muted-foreground text-center mt-0.5 md:mt-1 hidden md:block">
              Giây
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
