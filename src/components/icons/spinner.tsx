import { createMemo, createSignal, onCleanup } from 'solid-js';

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

function createSpinner(frames: string[], ms: number) {
  const [i, setI] = createSignal(0);
  const t = setInterval(() => setI((p) => (p + 1) % frames.length), ms);
  onCleanup(() => clearInterval(t));
  const frame = createMemo(() => frames[i()]);
  return frame;
}

export function Spinner() {
  const frame = createSpinner(sandFrames, 80);

  return (
    <span class='font-mono text-sm flex items-center gap-2 text-foreground'>
      <span>{frame()}</span>
    </span>
  );
}
