import { useEffect, useState } from 'react';

const sandFrames = [
  '⠁',
  '⠂',
  '⠄',
  '⡀',
  '⡈',
  '⡐',
  '⡠',
  '⣀',
  '⣁',
  '⣂',
  '⣄',
  '⣌',
  '⣔',
  '⣤',
  '⣥',
  '⣦',
  '⣮',
  '⣶',
  '⣷',
  '⣿',
  '⡿',
  '⠿',
  '⢟',
  '⠟',
  '⡛',
  '⠛',
  '⠫',
  '⢋',
  '⠋',
  '⠍',
  '⡉',
  '⠉',
  '⠑',
  '⠡',
  '⢁',
];

function useSpinner(frames: string[], ms: number) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % frames.length), ms);
    return () => clearInterval(t);
  }, [frames, ms]);
  return frames[i];
}

export function Spinner({ className }: { className?: string }) {
  const frame = useSpinner(sandFrames, 80);

  return (
    <span
      className={
        className ??
        'flex items-center gap-2 font-mono text-base text-foreground sm:text-sm'
      }
    >
      <span>{frame}</span>
    </span>
  );
}
