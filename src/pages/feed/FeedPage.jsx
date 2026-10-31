import { Clock, Flame, Newspaper } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { feedService } from '../../services/feedService';
import usePaginatedList from '../../hooks/usePaginatedList';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import FeedLayout from '../../components/layout/FeedLayout';
import PostComposer from '../../components/posts/PostComposer';
import PostList from '../../components/posts/PostList';
import Tabs from '../../components/common/Tabs';
import { PAGE_SIZE } from '../../utils/constants';

// GET /api/feed supports sort=latest|popular
const SORTS = [
  { value: 'latest', label: 'Latest', icon: Clock },
  { value: 'popular', label: 'Popular', icon: Flame },
];

export default function FeedPage() {
  useDocumentTitle('Home');
  const [params, setParams] = useSearchParams();
  const sort = params.get('sort') === 'popular' ? 'popular' : 'latest';

  const feed = usePaginatedList((page) => feedService.getFeed({ page, limit: PAGE_SIZE, sort }), {
    itemsKey: 'posts',
    deps: [sort],
  });

  const onCreated = (post) => {
    if (sort === 'latest') feed.prependItem(post);
    else setParams({});
  };

  return (
    <FeedLayout>
      <div className="space-y-4">
        <PostComposer onCreated={onCreated} />
        <div className="flex items-center justify-between pt-1">
          <h2 className="text-sm font-semibold text-ink-soft">Your feed</h2>
          <Tabs
            label="Sort feed"
            value={sort}
            onChange={(value) => setParams(value === 'latest' ? {} : { sort: value })}
            options={SORTS}
          />
        </div>
        <PostList
          list={feed}
          emptyIcon={Newspaper}
          emptyTitle="Your feed is empty"
          emptyDescription="Be the first to share something. Posts from everyone on the platform show up here."
        />
      </div>
    </FeedLayout>
  );
}
