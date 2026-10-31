import { useCallback, useState } from 'react';
import { parseApiError } from '../utils/apiError';

/**
 * Minimal form state: values, client/server field errors, a form-level error and submit status.
 * `validate(values)` returns { field: message }; server `errors[]` are merged in on failure.
 */
export default function useForm(initialValues, validate) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const setField = useCallback((name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => (current[name] ? { ...current, [name]: undefined } : current));
  }, []);

  const bind = (name) => ({
    name,
    value: values[name] ?? '',
    onChange: (event) => setField(name, event.target.value),
  });

  const handleSubmit = (onValid) => async (event) => {
    event?.preventDefault();
    if (submitting) return;
    const clientErrors = validate ? Object.fromEntries(Object.entries(validate(values)).filter(([, v]) => v)) : {};
    setErrors(clientErrors);
    setFormError(null);
    if (Object.keys(clientErrors).length) return;

    setSubmitting(true);
    try {
      await onValid(values);
    } catch (error) {
      const parsed = parseApiError(error);
      setErrors(parsed.fieldErrors);
      // Show the form-level message unless every problem is already shown next to a field
      if (!Object.keys(parsed.fieldErrors).length || parsed.status !== 400) {
        setFormError(parsed.status === 429 && parsed.retryAfter && !/second/.test(parsed.message)
          ? `${parsed.message} Try again in ${parsed.retryAfter}s.`
          : parsed.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return { values, setValues, setField, bind, errors, setErrors, formError, setFormError, submitting, handleSubmit };
}
