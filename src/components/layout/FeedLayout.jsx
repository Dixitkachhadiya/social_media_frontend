import RightRail from './RightRail';

// Center column + right rail (desktop only) used by feed-style pages
export default function FeedLayout({ children, rail = true }) {
  return (
    <div className="flex gap-8">
      <div className="min-w-0 flex-1 xl:max-w-[640px]">{children}</div>
      {rail && (
        <aside className="hidden w-80 shrink-0 xl:block">
          <div className="sticky top-20">
            <RightRail />
          </div>
        </aside>
      )}
    </div>
  );
}
