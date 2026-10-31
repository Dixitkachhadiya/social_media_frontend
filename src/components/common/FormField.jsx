import { cloneElement, useId } from 'react';

// Wires label, hint and error text to the input for screen readers
export default function FormField({ label, error, hint, children, className = '', aside }) {
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={className}>
      {(label || aside) && (
        <div className="flex items-baseline justify-between gap-3">
          {label && (
            <label htmlFor={id} className="label">
              {label}
            </label>
          )}
          {aside}
        </div>
      )}
      {cloneElement(children, {
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': describedBy,
        className: `${children.props.className || 'input'} ${error ? 'input-error' : ''}`,
      })}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
