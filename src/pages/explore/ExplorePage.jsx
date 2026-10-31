import { useSearchParams } from 'react-router-dom';
import { ArrowDownWideNarrow, Clock, Compass, Flame, History } from 'lucide-react';
import { postService } from '../../services/postService';
import usePaginatedList from '../../hooks/usePaginatedList';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import FeedLayout from '../../components/layout/FeedLayout';
import PostList from '../../components/posts/PostList';
import Tabs from '../../components/common/Tabs';
import { PAGE_SIZE } from '../../utils/constants';

// GET /api/posts supports sort=latest|oldest|popular (there is no search endpoint)
const SORTS = [
  { value: 'popular', label: 'Popular', icon: Flame },
  { value: 'latest', label: 'Newest', icon: Clock },
  { value: 'oldest', label: 'Oldest', icon: History },
];

const DESCRIPTIONS = {
  popular: 'The most-liked posts across the platform.',
  latest: 'Everything, as it gets posted.',
  oldest: 'Go back to where it all started.',
};

export default function ExplorePage() {
  useDocumentTitle('Explore');
  const [params, setParams] = useSearchParams();
  const sort = SORTS.some((s) => s.value === params.get('sort')) ? params.get('sort') : 'popular';

  const posts = usePaginatedList((page) => postService.list({ page, limit: PAGE_SIZE, sort }), {
    itemsKey: 'posts',
    deps: [sort],
  });

  return (
    <FeedLayout>
      <div className="space-y-4">
        <section className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <Compass className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-[15px] font-semibold text-ink">Discover posts</h2>
              <p className="text-sm text-muted">{DESCRIPTIONS[sort]}</p>
            </div>
          </div>
          <Tabs label="Sort posts" value={sort} onChange={(value) => setParams({ sort: value })} options={SORTS} />
        </section>

        {posts.pagination && (
          <p className="flex items-center gap-1.5 px-1 text-xs text-muted">
            <ArrowDownWideNarrow className="h-3.5 w-3.5" aria-hidden="true" />
            {posts.pagination.total.toLocaleString()} posts
          </p>
        )}

        <PostList list={posts} emptyIcon={Compass} emptyTitle="Nothing to explore yet" emptyDescription="Posts will appear here as people start sharing." />
      </div>
    </FeedLayout>
  );
}
