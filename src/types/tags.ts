export interface TagFieldProps {
  value: readonly string[];
  onChange: (next: string[]) => void;
  autoFocus: boolean;
}
