import Button from './Button';

export default function LoadMore({ hasMore, loading, onClick, label = 'Load more' }) {
  if (!hasMore) return null;
  return (
    <div className="flex justify-center py-4">
      <Button variant="secondary" onClick={onClick} loading={loading}>
        {label}
      </Button>
    </div>
  );
}
