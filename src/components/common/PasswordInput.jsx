import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const PasswordInput = forwardRef(function PasswordInput({ className = 'input', ...props }, ref) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input ref={ref} type={visible ? 'text' : 'password'} className={`${className} pr-10`} {...props} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted hover:text-ink"
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
});

export default PasswordInput;
