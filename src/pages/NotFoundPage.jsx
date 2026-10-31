import { Link } from 'react-router-dom';
import { MapPinOff } from 'lucide-react';
import EmptyState from '../components/common/EmptyState';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function NotFoundPage() {
  useDocumentTitle('Page not found');
  return (
    <div className="card mx-auto max-w-xl">
      <EmptyState
        icon={MapPinOff}
        title="Page not found"
        description="The page you're looking for doesn't exist or has moved."
        action={
          <Link to="/" className="link text-sm">
            Go to home
          </Link>
        }
      />
    </div>
  );
}
