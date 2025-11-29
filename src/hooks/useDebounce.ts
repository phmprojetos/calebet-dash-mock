import { useState, useEffect } from "react";

/**
 * Hook para debounce de valores
 * Útil para evitar chamadas excessivas à API durante digitação
 *
 * @param value - O valor a ser debounced
 * @param delay - O tempo de delay em milissegundos (padrão: 300ms)
 * @returns O valor debounced
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

