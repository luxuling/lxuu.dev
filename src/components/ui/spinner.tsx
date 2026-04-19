import { createSignal, onCleanup } from "solid-js";

const sandFrames = [
  "⠁",
  "⠂",
  "⠄",
  "⡀",
  "⡈",
  "⡐",
  "⡠",
  "⣀",
  "⣁",
  "⣂",
  "⣄",
  "⣌",
  "⣔",
  "⣤",
  "⣥",
  "⣦",
  "⣮",
  "⣶",
  "⣷",
  "⣿",
  "⡿",
  "⠿",
  "⢟",
  "⠟",
  "⡛",
  "⠛",
  "⠫",
  "⢋",
  "⠋",
  "⠍",
  "⡉",
  "⠉",
  "⠑",
  "⠡",
  "⢁",
];

function createSpinner(frames: string[], ms: number) {
  const [i, setI] = createSignal(0);
  const t = setInterval(() => setI((p) => (p + 1) % frames.length), ms);
  onCleanup(() => clearInterval(t));
  return () => frames[i()];
}

export function Spinner() {
  const frame = createSpinner(sandFrames, 80);

  return (
    <span class="font-mono text-sm flex items-center gap-2 text-foreground">
      <span>{frame()}</span>
    </span>
  );
}
