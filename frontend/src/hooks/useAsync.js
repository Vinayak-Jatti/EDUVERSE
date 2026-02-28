import { useState, useCallback } from "react";

/**
 * useAsync — wraps any async function with loading/error/data state.
 *
 * @example
 *   const { execute, data, loading, error } = useAsync(loginUser);
 *   await execute({ email, password });
 */
const useAsync = (asyncFunction) => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const result = await asyncFunction(...args);
        setData(result.data);
        return result.data;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [asyncFunction]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { execute, data, loading, error, reset };
};

export default useAsync;
