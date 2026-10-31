// Renders a notification message with the actor's username emphasised.
// Backend messages start with the actor's username ("priya liked your post").
export default function NotificationMessage({ notification }) {
  const { message, related_user: actor } = notification;
  if (actor?.username && message.startsWith(actor.username)) {
    return (
      <>
        <span className="font-semibold text-ink">{actor.username}</span>
        {message.slice(actor.username.length)}
      </>
    );
  }
  return message;
}
