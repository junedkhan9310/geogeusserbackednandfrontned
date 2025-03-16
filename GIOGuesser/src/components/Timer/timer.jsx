"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const Timer = ({ duration = 5, onComplete, redirectTo, position = "top" }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const router = useRouter();
  
  useEffect(() => {
    if (timeLeft <= 0) {
      if (redirectTo) {
        router.push(redirectTo);
      }
      if (onComplete) {
        onComplete();
      }
      return;
    }
    
    const timerId = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);
    
    return () => clearTimeout(timerId);
  }, [timeLeft, redirectTo, onComplete, router]);
  
  // Calculate progress percentage
  const progress = ((duration - timeLeft) / duration) * 100;
  
  return (
    <div className={`fixed ${position === "top" ? "top-0" : "bottom-0"} left-0 right-0 z-50`}>
      <div className="mx-auto max-w-md bg-gray-800 bg-opacity-80 px-4 py-2 rounded-b-lg shadow-lg">
        <div className="flex items-center justify-between">
          <div className="text-white font-medium">Moving to next stage in: {timeLeft}s</div>
          <div className="w-24 bg-gray-500 rounded-full h-2 ml-4">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-1000 ease-linear" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timer;