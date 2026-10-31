import { ShieldCheck } from 'lucide-react';
import { adminService } from '../../services/adminService';
import usePaginatedList from '../../hooks/usePaginatedList';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import PostList from '../../components/posts/PostList';
import Alert from '../../components/common/Alert';

// GET /admin/dashboard/recent-posts (includes posts by deactivated users).
// Removal uses DELETE /posts/:id; comments are moderated on each post's page via DELETE /comments/:id.
export default function AdminModerationPage() {
  useDocumentTitle('Moderation');
  const posts = usePaginatedList((page) => adminService.recentPosts({ page, limit: 10 }), { itemsKey: 'posts' });

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Alert tone="info" title="How moderation works">
        Recent posts from every account, including deactivated ones, are listed newest first. Use a post's menu to remove it. To moderate
        comments, open the post: as an admin you can remove any comment.
      </Alert>
      <PostList list={posts} emptyIcon={ShieldCheck} emptyTitle="No posts to review" />
    </div>
  );
}
