const STRONG = new Set(['THREAT', 'HATE_SPEECH', 'HARASSMENT']);

// Renders text with flagged ranges (words reported by the AI moderation check) highlighted.
// start/end are UTF-16 offsets supplied by the backend, so they line up with JavaScript strings.
export default function HighlightedText({ text, flagged = [] }) {
  const ranges = [...flagged]
    .filter((f) => Number.isInteger(f.start) && Number.isInteger(f.end) && f.end > f.start && f.end <= text.length)
    .sort((a, b) => a.start - b.start);

  const parts = [];
  let cursor = 0;
  ranges.forEach((range, index) => {
    if (range.start < cursor) return;
    if (range.start > cursor) parts.push(<span key={`t-${index}`}>{text.slice(cursor, range.start)}</span>);
    parts.push(
      <mark
        key={`m-${index}`}
        title={range.category?.replace('_', ' ').toLowerCase()}
        className={`rounded px-0.5 font-medium ${STRONG.has(range.category) ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-900'}`}
      >
        {text.slice(range.start, range.end)}
      </mark>,
    );
    cursor = range.end;
  });
  if (cursor < text.length) parts.push(<span key="t-end">{text.slice(cursor)}</span>);

  return <p className="text-sm leading-relaxed break-words whitespace-pre-wrap text-ink">{parts}</p>;
}
