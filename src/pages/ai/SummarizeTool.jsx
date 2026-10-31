import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, FileText, MessageCircle } from 'lucide-react';
import { aiService } from '../../services/aiService';
import { postService } from '../../services/postService';
import usePaginatedList from '../../hooks/usePaginatedList';
import { displayName, formatCount, timeAgo } from '../../utils/format';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import Tabs from '../../components/common/Tabs';
import LoadMore from '../../components/common/LoadMore';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { ListSkeleton } from '../../components/common/Skeleton';
import AIErrorNotice from '../../components/ai/AIErrorNotice';
import SummaryResult from '../../components/ai/SummaryResult';
import useAIRequest from './useAIRequest';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// POST /api/ai/summarize { postId }. Posts are picked from GET /api/posts.
export default function SummarizeTool({ initialPostId }) {
  const [sort, setSort] = useState('popular');
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const { loading, error, setError, run } = useAIRequest();

  const posts = usePaginatedList((page) => postService.list({ page, limit: 8, sort }), { itemsKey: 'posts', deps: [sort] });

  // Preselect a post passed via ?post=<id> (from a post's menu)
  useEffect(() => {
    if (!initialPostId || !UUID.test(initialPostId)) return;
    postService
      .get(initialPostId)
      .then(({ post }) => setSelected(post))
      .catch(() => {});
  }, [initialPostId]);

  const summarize = async () => {
    if (!selected) return;
    const res = await run(() => aiService.summarize(selected.id));
    if (res) setResult(res);
  };

  const choose = (post) => {
    setSelected(post);
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-4">
      <section className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
          <h3 className="text-sm font-semibold text-ink">Choose a post</h3>
          <Tabs
            label="Sort posts"
            value={sort}
            onChange={setSort}
            options={[
              { value: 'popular', label: 'Popular' },
              { value: 'latest', label: 'Latest' },
            ]}
          />
        </div>

        {posts.status === 'loading' && <ListSkeleton rows={4} />}
        {posts.status === 'error' && <ErrorState message={posts.error} onRetry={posts.reload} />}
        {posts.status === 'ready' && posts.items.length === 0 && <EmptyState icon={FileText} title="No posts to summarize yet" />}

        <ul className="max-h-[360px] divide-y divide-line overflow-y-auto" role="listbox" aria-label="Posts">
          {posts.items.map((post) => {
            const active = selected?.id === post.id;
            return (
              <li key={post.id} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => choose(post)}
                  className={`flex w-full items-start gap-3 px-5 py-3 text-left transition-colors ${active ? 'bg-brand-50/70' : 'hover:bg-slate-50'}`}
                >
                  <Avatar src={post.author.avatar_url} name={displayName(post.author)} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs text-muted">
                      <span className="font-medium text-ink-soft">{displayName(post.author)}</span> · {timeAgo(post.created_at)}
                    </span>
                    <span className="mt-0.5 line-clamp-2 block text-sm text-ink">{post.content}</span>
                    <span className="mt-1 inline-flex items-center gap-1 text-xs text-muted">
                      <MessageCircle className="h-3 w-3" aria-hidden="true" /> {formatCount(post.comments_count)} comments
                    </span>
                  </span>
                  {active && <Check className="mt-1 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />}
                </button>
              </li>
            );
          })}
        </ul>
        <LoadMore hasMore={posts.hasMore} loading={posts.loadingMore} onClick={posts.loadMore} />
      </section>

      <section className="card flex flex-wrap items-center justify-between gap-3 p-4">
        <p className="min-w-0 flex-1 text-sm text-ink-soft">
          {selected ? (
            <>
              Selected:{' '}
              <Link to={`/posts/${selected.id}`} className="link">
                “{selected.content.slice(0, 60)}
                {selected.content.length > 60 ? '…' : ''}”
              </Link>
            </>
          ) : (
            'Select a post above to summarize its discussion.'
          )}
        </p>
        <Button onClick={summarize} loading={loading} disabled={!selected}>
          {loading ? 'Summarizing…' : 'Summarize'}
        </Button>
      </section>

      <AIErrorNotice error={error} />
      {result && <SummaryResult data={result.data} meta={result.meta} />}
    </div>
  );
}
