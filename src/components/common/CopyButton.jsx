import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CopyButton({ text, label = 'Copy', className = '' }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Couldn't copy to the clipboard");
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      disabled={!text}
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-ink-soft transition-colors hover:bg-white
        hover:text-ink disabled:opacity-50 ${className}`}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
      {copied ? 'Copied' : label}
    </button>
  );
}
