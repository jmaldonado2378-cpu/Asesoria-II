import { useState, useCallback } from 'react';
import { ApiError } from '../api/httpClient.js';

export function useApiMutation(apiFn) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);        // general error message string
  const [fieldErrors, setFieldErrors] = useState({}); // { fieldName: 'error msg' }

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    setFieldErrors({});
    try {
      const result = await apiFn(...args);
      return result;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setFieldErrors(err.fieldErrors || {});
      } else {
        setError('Error de conexión. Intentá nuevamente.');
      }
      throw err; // re-throw so caller can handle
    } finally {
      setLoading(false);
    }
  }, [apiFn]);

  const reset = useCallback(() => {
    setError(null);
    setFieldErrors({});
  }, []);

  return { loading, error, fieldErrors, execute, reset };
}
