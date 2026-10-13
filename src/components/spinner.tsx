import { useSpinnerFrame } from '@/hooks/use-spinner-frame';

const SAND_FRAMES = [
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

const FRAME_INTERVAL_MS = 80;

interface Props {
  className?: string;
}

export const Spinner = ({
  className = 'flex items-center gap-2 font-mono text-base text-foreground sm:text-sm',
}: Props) => {
  const frame = useSpinnerFrame(SAND_FRAMES, FRAME_INTERVAL_MS);

  return (
    <span className={className}>
      <span>{frame}</span>
    </span>
  );
};
