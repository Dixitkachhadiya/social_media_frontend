import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

// Numbered paging for admin tables, driven by the backend's pagination object
export default function Pagination({ pagination, onPageChange, disabled }) {
  if (!pagination || pagination.total_pages <= 1) return null;
  const { page, total_pages: totalPages, total, limit } = pagination;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between gap-3 px-1 py-3 text-sm text-muted">
      <span>
        {from}–{to} of {total}
      </span>
      <div className="flex items-center gap-1">
        <Button variant="secondary" size="icon-sm" onClick={() => onPageChange(page - 1)} disabled={disabled || page <= 1} aria-label="Previous page">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="px-2 tabular-nums text-ink-soft">
          {page} / {totalPages}
        </span>
        <Button variant="secondary" size="icon-sm" onClick={() => onPageChange(page + 1)} disabled={disabled || page >= totalPages} aria-label="Next page">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
