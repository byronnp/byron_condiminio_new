const PALETTE = [
  'purple',
  'teal',
  'indigo',
  'brown',
  'blue-grey',
  'cyan',
  'pink',
  'deep-purple',
] as const;

export function colorForLabel(label: string): string {
  let hash = 0;
  for (let i = 0; i < label.length; i += 1) {
    hash += label.charCodeAt(i);
  }
  return PALETTE[hash % PALETTE.length]!;
}
