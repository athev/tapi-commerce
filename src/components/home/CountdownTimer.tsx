import { useState, useEffect } from "react";
interface CountdownTimerProps {
  endTime: Date;
}
const CountdownTimer = ({
  endTime
}: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = endTime.getTime() - Date.now();
      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor(difference / (1000 * 60 * 60) % 24),
          minutes: Math.floor(difference / 1000 / 60 % 60),
          seconds: Math.floor(difference / 1000 % 60)
        });
      } else {
        setTimeLeft({
          hours: 0,
          minutes: 0,
          seconds: 0
        });
      }
    };
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [endTime]);
  const formatNumber = (num: number) => String(num).padStart(2, "0");
  return <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {/* Hours */}
        <div className="bg-black text-white font-bold px-1.5 py-0.5 rounded text-sm min-w-[1.75rem] text-center">
          {formatNumber(timeLeft.hours)}
        </div>
        
        
        
        {/* Minutes */}
        <div className="bg-black text-white font-bold px-1.5 py-0.5 rounded text-sm min-w-[1.75rem] text-center">
          {formatNumber(timeLeft.minutes)}
        </div>
        
        
        
        {/* Seconds */}
        <div className="bg-black text-white font-bold px-1.5 py-0.5 rounded text-sm min-w-[1.75rem] text-center">
          {formatNumber(timeLeft.seconds)}
        </div>
      </div>
    </div>;
};
export default CountdownTimer;