/**
 * Utility functions intended only for testing and not to be included in any
 * final builds.
 */

/**
 * Generates a "Lorem Ipsum" string of exactly n characters.
 * @param n - The desired length of the resulting string.
 * @returns A string of length n composed of repeating Lorem Ipsum text.
 */
export const createLoremIpsumText = (n: number): string => {
  if (n <= 0) {
    return '';
  }

  const baseText =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
    'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ' +
    'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris ' +
    'nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in ' +
    'reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla ' +
    'pariatur. Excepteur sint occaecat cupidatat non proident, sunt in ' +
    'culpa qui officia deserunt mollit anim id est laborum. ';

  const repeatCount = Math.ceil(n / baseText.length);
  return baseText.repeat(repeatCount).slice(0, n);
};
