import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Lightbulb, Sparkles } from 'lucide-react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import PostComposer from '../../components/posts/PostComposer';
import Alert from '../../components/common/Alert';

const TIPS = [
  'Lead with the point. The first line is what people see in the feed.',
  'Short paragraphs read better on phones.',
  'Ask a question if you want replies.',
];

export default function CreatePostPage() {
  useDocumentTitle('Create post');
  const navigate = useNavigate();
  // Drafts handed over from the AI Assistant are never auto-published
  const draft = useLocation().state?.draft ?? '';

  return (
    <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[1fr_260px]">
      <div className="space-y-4">
        {draft && (
          <Alert tone="info" title="AI draft loaded">
            Review and edit the text below. Nothing is published until you press Publish.
          </Alert>
        )}
        <PostComposer expanded autoFocus initialContent={draft} onCreated={(post) => navigate(`/posts/${post.id}`)} />
      </div>

      <aside className="space-y-4">
        <section className="card p-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Lightbulb className="h-4 w-4 text-amber-500" aria-hidden="true" /> Writing tips
          </h2>
          <ul className="mt-2 space-y-2 text-sm text-muted">
            {TIPS.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </section>
        <section className="card p-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Sparkles className="h-4 w-4 text-brand-600" aria-hidden="true" /> Need a starting point?
          </h2>
          <p className="mt-1 text-sm text-muted">Give the AI Assistant a topic and a tone, and it will draft a post for you to edit.</p>
          <Link to="/ai" className="link mt-2 inline-block text-sm">
            Generate a draft
          </Link>
        </section>
      </aside>
    </div>
  );
}
