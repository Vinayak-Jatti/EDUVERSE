import { useState } from "react";

/**
 * useLocalStorage — synced localStorage state.
 *
 * @example
 *   const [theme, setTheme] = useLocalStorage("theme", "light");
 */
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (err) {
      console.error(`useLocalStorage [${key}]:`, err);
    }
  };

  return [storedValue, setValue];
};

export default useLocalStorage;
