/** Normalize untrusted pagination without NaN, negative or unbounded sizes. */
export function boundedInteger(value: string | number | null | undefined, fallback: number, max: number): number {
  if (value == null || value === '') return fallback;
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? Math.min(number, max) : fallback;
}
