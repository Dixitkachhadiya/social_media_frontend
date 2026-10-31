import { useEffect, useRef } from 'react';

/**
 * Six single-digit boxes with keyboard navigation, paste support and
 * autocomplete="one-time-code" (SMS/email code suggestions on mobile).
 * The code lives only in React state; it is never stored or logged.
 */
export default function OtpInput({ value, onChange, length = 6, disabled = false, invalid = false, autoFocus = false, onComplete, label = 'Verification code' }) {
  const inputs = useRef([]);
  const digits = Array.from({ length }, (_, i) => value[i] || '');

  useEffect(() => {
    if (autoFocus) inputs.current[0]?.focus();
  }, [autoFocus]);

  const focus = (index) => inputs.current[Math.max(0, Math.min(length - 1, index))]?.focus();

  const update = (next) => {
    const clean = next.replace(/\D/g, '').slice(0, length);
    onChange(clean);
    if (clean.length === length) onComplete?.(clean);
  };

  const handleChange = (index, event) => {
    const typed = event.target.value.replace(/\D/g, '');
    if (!typed) return;
    // A multi-character value comes from autofill or paste into one box
    if (typed.length > 1) {
      update(typed);
      focus(typed.length);
      return;
    }
    const next = digits.slice();
    next[index] = typed;
    update(next.join(''));
    focus(index + 1);
  };

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace') {
      event.preventDefault();
      const next = digits.slice();
      if (next[index]) {
        next[index] = '';
      } else if (index > 0) {
        next[index - 1] = '';
        focus(index - 1);
      }
      onChange(next.join('').slice(0, length));
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      focus(index - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      focus(index + 1);
    }
  };

  const handlePaste = (event) => {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '');
    if (!pasted) return;
    event.preventDefault();
    update(pasted);
    focus(pasted.length);
  };

  return (
    <div role="group" aria-label={label} className="flex justify-between gap-2 sm:gap-3">
      {digits.map((digit, index) => (
        <input
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          ref={(el) => {
            inputs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={length}
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          aria-label={`${label} digit ${index + 1}`}
          aria-invalid={invalid || undefined}
          disabled={disabled}
          value={digit}
          onChange={(event) => handleChange(index, event)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          onFocus={(event) => event.target.select()}
          className={`h-12 w-full min-w-0 rounded-lg border bg-white text-center font-mono text-xl font-semibold text-ink transition-colors
            focus:ring-3 focus:outline-none disabled:bg-slate-50 sm:h-14 sm:text-2xl
            ${invalid ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-line focus:border-brand-500 focus:ring-brand-100'}`}
        />
      ))}
    </div>
  );
}
