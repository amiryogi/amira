import { useState, useEffect, useCallback } from 'react';

export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export function useDebouncedCallback<T extends (...args: unknown[]) => void>(
  callback: T,
  delay = 300,
): T {
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const debouncedFn = useCallback(
    (...args: unknown[]) => {
      if (timer) clearTimeout(timer);
      setTimer(setTimeout(() => callback(...args), delay));
    },
    [callback, delay, timer],
  ) as T;

  return debouncedFn;
}
