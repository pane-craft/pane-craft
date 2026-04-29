/**
 * A simple numeric clamping utility function.
 *
 * @param value - The number to clamp against.
 * @param min - The minimum possible value.
 * @param max - The maximum possible value.
 * @returns `value` for numbers between `min` and `max`, `min` for numbers
 *   equal to or less than `min`, or `max` for numbers equal to or greather
 *   than `max`.
 */
export const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));
