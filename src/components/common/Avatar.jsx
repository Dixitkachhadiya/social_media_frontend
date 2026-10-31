import { useState } from 'react';

const SIZES = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
  xl: 'h-24 w-24 text-3xl',
};

const initialsOf = (name = '') =>
  name
    .replace(/[_.-]+/g, ' ')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || '?';

export default function Avatar({ src, name, size = 'md', className = '' }) {
  const [failedSrc, setFailedSrc] = useState(null);
  const showImage = src && failedSrc !== src;

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-50 font-semibold text-brand-700
        ring-1 ring-black/5 ${SIZES[size]} ${className}`}
    >
      {showImage ? (
        <img src={src} alt="" className="h-full w-full object-cover" onError={() => setFailedSrc(src)} loading="lazy" />
      ) : (
        <span aria-hidden="true">{initialsOf(name)}</span>
      )}
    </span>
  );
}
