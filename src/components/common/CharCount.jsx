export default function CharCount({ value = '', max }) {
  const length = value.length;
  const remaining = max - length;
  const tone = remaining < 0 ? 'text-red-600 font-medium' : remaining <= max * 0.1 ? 'text-amber-600' : 'text-muted';
  return (
    <span className={`text-xs tabular-nums ${tone}`} aria-live="polite">
      {length.toLocaleString()}/{max.toLocaleString()}
    </span>
  );
}
