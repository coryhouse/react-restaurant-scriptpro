import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

function readValue<T>(key: string, initial: T): T {
  const item = window.localStorage.getItem(key);
  if (item) {
    try {
      return JSON.parse(item) as T;
    } catch (e) {
      console.warn(`Error parsing localStorage key "${key}":`, e);
    }
  }
  return initial;
}

export function useLocalStorage<T>(
  key: string,
  initial: T,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => readValue(key, initial));

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
