/**
 * Debounce utility function
 */

export function debounce<A extends unknown[], R>(
  func: (...args: A) => R,
  wait: number
): (...args: A) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: A) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(later, wait);
  };
}
