import { useEffect, useState } from 'react';

export const useSpinnerFrame = (frames: string[], intervalMs: number) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setIndex((previous) => (previous + 1) % frames.length),
      intervalMs,
    );

    return () => clearInterval(timer);
  }, [frames, intervalMs]);

  return frames[index];
};
