import { useEffect, useRef } from "react";

export function useDebounced<T extends (...args: any[]) => void>(fn: T, delay = 400) {
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (timer.current) {
        window.clearTimeout(timer.current);
      }
    };
  }, []);

  return (...args: Parameters<T>) => {
    if (timer.current) {
      window.clearTimeout(timer.current);
    }

    timer.current = window.setTimeout(() => {
      fn(...args);
    }, delay);
  };
}
