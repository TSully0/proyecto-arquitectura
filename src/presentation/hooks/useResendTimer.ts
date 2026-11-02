import { useEffect, useState } from "react";

const RESEND_DELAY = 5 * 60;

export function useResendTimer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (seconds <= 0) return;

    const timer = window.setTimeout(() => {
      setSeconds((previous) =>
        Math.max(previous - 1, 0)
      );
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [seconds]);

  const startTimer = (duration = RESEND_DELAY) => {
    setSeconds(duration);
  };

  const clearTimer = () => {
    setSeconds(0);
  };

  const formatTime = () => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  return {
    seconds,
    isActive: seconds > 0,
    startTimer,
    clearTimer,
    formattedTime: formatTime()
  };
}