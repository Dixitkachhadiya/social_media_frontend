import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ImageOff } from 'lucide-react';
import Avatar from '../common/Avatar';
import { displayName, formatDateTime, timeAgo } from '../../utils/format';

export const profilePath = (authorId, currentUserId) => (authorId === currentUserId ? '/profile' : `/u/${authorId}`);

const wasEdited = (post) => post.updated_at && post.created_at && new Date(post.updated_at) - new Date(post.created_at) > 1000;

export function PostHeader({ post, currentUserId, actions, linkAuthor = true }) {
  const { author } = post;
  const name = displayName(author);
  const NameTag = linkAuthor ? Link : 'span';
  const linkProps = linkAuthor ? { to: profilePath(author.id, currentUserId) } : {};

  return (
    <div className="flex items-start gap-3">
      <NameTag {...linkProps} className="shrink-0" tabIndex={linkAuthor ? -1 : undefined} aria-hidden={linkAuthor || undefined}>
        <Avatar src={author.avatar_url} name={name} />
      </NameTag>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-1.5">
          <NameTag {...linkProps} className={`truncate text-[15px] font-semibold text-ink ${linkAuthor ? 'hover:underline' : ''}`}>
            {name}
          </NameTag>
          <span className="truncate text-sm text-muted">@{author.username}</span>
        </div>
        <p className="text-xs text-muted">
          <time dateTime={post.created_at} title={formatDateTime(post.created_at)}>
            {post.created_at ? timeAgo(post.created_at) : 'Preview'}
          </time>
          {wasEdited(post) && <span title={`Edited ${formatDateTime(post.updated_at)}`}> · Edited</span>}
        </p>
      </div>
      {actions}
    </div>
  );
}

export function PostImage({ src }) {
  const [failed, setFailed] = useState(null);
  if (!src) return null;

  if (failed === src) {
    return (
      <div className="mt-3 flex items-center gap-2 rounded-xl border border-dashed border-line bg-slate-50 px-4 py-6 text-sm text-muted">
        <ImageOff className="h-4 w-4" aria-hidden="true" /> Image could not be loaded
      </div>
    );
  }

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-line bg-slate-50">
      <img src={src} alt="" loading="lazy" className="max-h-[520px] w-full object-cover" onError={() => setFailed(src)} />
    </div>
  );
}

const CLAMP_AT = 480;

export function PostContent({ content, clamp = false }) {
  const [expanded, setExpanded] = useState(false);
  const long = clamp && content.length > CLAMP_AT;
  const text = long && !expanded ? `${content.slice(0, CLAMP_AT).trimEnd()}…` : content;

  return (
    <div className="mt-3 text-[15px] leading-relaxed text-ink">
      <p className="break-words whitespace-pre-wrap">{text}</p>
      {long && (
        <button type="button" onClick={() => setExpanded((v) => !v)} className="link mt-1 text-sm">
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  );
}
