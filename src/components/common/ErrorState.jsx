import { AlertCircle } from 'lucide-react';
import Button from './Button';

export default function ErrorState({ message, onRetry, className = '' }) {
  return (
    <div className={`flex flex-col items-center px-6 py-12 text-center ${className}`} role="alert">
      <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600">
        <AlertCircle className="h-5 w-5" aria-hidden="true" />
      </span>
      <p className="max-w-sm text-sm text-ink-soft">{message || 'Something went wrong.'}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
