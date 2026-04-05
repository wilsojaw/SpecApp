const FRACTIONS: [number, string][] = [
  [1 / 16, "1/16"],
  [1 / 8, "1/8"],
  [3 / 16, "3/16"],
  [1 / 4, "1/4"],
  [5 / 16, "5/16"],
  [3 / 8, "3/8"],
  [7 / 16, "7/16"],
  [1 / 2, "1/2"],
  [9 / 16, "9/16"],
  [5 / 8, "5/8"],
  [11 / 16, "11/16"],
  [3 / 4, "3/4"],
  [13 / 16, "13/16"],
  [7 / 8, "7/8"],
  [15 / 16, "15/16"],
];

export function formatInches(value: number): string {
  if (value === 0) return '0"';

  const whole = Math.floor(value);
  const remainder = value - whole;

  if (remainder < 1 / 32) {
    return `${whole}"`;
  }

  let closest = FRACTIONS[0];
  let minDiff = Math.abs(remainder - closest[0]);
  for (const frac of FRACTIONS) {
    const diff = Math.abs(remainder - frac[0]);
    if (diff < minDiff) {
      minDiff = diff;
      closest = frac;
    }
  }

  if (whole === 0) {
    return `${closest[1]}"`;
  }
  return `${whole}-${closest[1]}"`;
}

export function formatDimension(length: number, width: number): string {
  return `${formatInches(length)} x ${formatInches(width)}`;
}

export function formatThickness(thickness: number): string {
  if (thickness === 0.75) return '3/4"';
  if (thickness === 0.25) return '1/4"';
  if (thickness === 0.5) return '1/2"';
  return formatInches(thickness);
}
