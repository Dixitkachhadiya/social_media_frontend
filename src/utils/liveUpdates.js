// Turns a socket "post:activity" event into a patch for a post object. Counts come from the server
// (absolute values), so they also correct this tab's optimistic updates. liked_by_me only changes for
// the user's own like/unlike (e.g. made in another tab).
export const postActivityPatch = (activity, myUserId) => ({
  likes_count: activity.likes_count,
  comments_count: activity.comments_count,
  ...(activity.actor_id === myUserId && activity.type === 'like' && { liked_by_me: true }),
  ...(activity.actor_id === myUserId && activity.type === 'unlike' && { liked_by_me: false }),
});

export const COMMENT_ACTIVITY = new Set(['comment-added', 'comment-updated', 'comment-deleted']);
