import { useEffect, useState } from 'react';

/**
 * useDebounce - Debounce a value by a given delay (ms)
 * @param value The value to debounce
 * @param delay The debounce delay in milliseconds
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce; 