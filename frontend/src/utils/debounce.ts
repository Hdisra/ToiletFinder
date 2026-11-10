import { useEffect, useState } from "react";

/** Returns `value` after it stopped changing for `delayMs`. */
export function useDebounced<T>(value: T, delayMs = 300) {
  // Latest value that stayed unchanged for `delayMs`.
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}
