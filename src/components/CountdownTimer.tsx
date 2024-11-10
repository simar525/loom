import React, { useEffect, useState } from 'react';

interface CountdownTimerProps {
  duration: number;
  onComplete: () => void;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ duration, onComplete }) => {
  const [count, setCount] = useState(duration);

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => setCount(count - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      onComplete();
    }
  }, [count, onComplete]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="text-9xl font-bold text-white animate-pulse">
        {count}
      </div>
    </div>
  );
};

export default CountdownTimer;