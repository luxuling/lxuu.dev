import { useSpinnerFrame } from '@/hooks/use-spinner-frame';

const BRAILLE_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

const FRAME_INTERVAL_MS = 80;

interface Props {
  className?: string;
}

export const Spinner = ({ className = '' }: Props) => {
  const frame = useSpinnerFrame(BRAILLE_FRAMES, FRAME_INTERVAL_MS);

  return (
    <span className={className} aria-hidden='true'>
      {frame}
    </span>
  );
};
