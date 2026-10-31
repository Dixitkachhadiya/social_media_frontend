import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { postService } from '../../services/postService';
import { LIMITS } from '../../utils/constants';
import { timeAgo } from '../../utils/format';
import FormField from '../../components/common/FormField';
import CharCount from '../../components/common/CharCount';
import SummaryPanel from '../../components/ai/SummaryPanel';

// Summarize any text, or the text of one of your own posts (POST /api/ai/summarize { content, length })
export default function TextSummaryTool() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [myPosts, setMyPosts] = useState([]);

  useEffect(() => {
    let cancelled = false;
    postService
      .list({ userId: user.id, limit: 5, sort: 'latest' })
      .then((data) => !cancelled && setMyPosts(data.posts))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user.id]);

  return (
    <div className="space-y-4">
      <div className="card space-y-4 p-5">
        <FormField label="Text to summarize" aside={<CharCount value={text.trim()} max={LIMITS.post} />}>
          <textarea
            rows={7}
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Paste a long paragraph, or pick one of your posts below."
            className="input resize-y text-[15px] leading-relaxed"
          />
        </FormField>
        {myPosts.length > 0 && (
          <div>
            <p className="label">Or use one of your posts</p>
            <ul className="flex flex-col gap-1.5">
              {myPosts.map((post) => (
                <li key={post.id}>
                  <button
                    type="button"
                    onClick={() => setText(post.content)}
                    className="w-full rounded-lg border border-line px-3 py-2 text-left text-sm transition-colors hover:border-brand-200 hover:bg-brand-50/40"
                  >
                    <span className="line-clamp-1 text-ink">{post.content}</span>
                    <span className="text-xs text-muted">{timeAgo(post.created_at)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="card p-5">
        <SummaryPanel
          content={text.trim().length <= LIMITS.post ? text : ''}
          useLabel="Use in a post"
          onUse={(summary) => navigate('/create', { state: { draft: summary } })}
        />
      </div>
    </div>
  );
}
