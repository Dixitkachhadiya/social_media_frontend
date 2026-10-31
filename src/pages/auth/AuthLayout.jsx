import { Link } from 'react-router-dom';
import { MessageCircle, Sparkles, Zap } from 'lucide-react';
import Logo from '../../components/common/Logo';
import { APP_NAME } from '../../utils/constants';

const HIGHLIGHTS = [
  { icon: MessageCircle, title: 'Real conversations', text: 'Post updates, comment, and keep up with the people you care about.' },
  { icon: Zap, title: 'Live notifications', text: 'Likes, comments and announcements arrive the moment they happen.' },
  { icon: Sparkles, title: 'AI writing help', text: 'Draft, polish and summarize. You always review before anything is posted.' },
];

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen bg-white">
      <aside className="hidden w-[44%] max-w-xl flex-col justify-between border-r border-line bg-canvas p-12 lg:flex">
        <Link to="/" aria-label={`${APP_NAME} home`}>
          <Logo />
        </Link>
        <div>
          <h2 className="max-w-sm text-[28px] leading-tight font-semibold tracking-tight text-ink">
            A calmer place to share what you're working on.
          </h2>
          <ul className="mt-10 space-y-6">
            {HIGHLIGHTS.map(({ icon: Icon, title: heading, text }) => (
              <li key={heading} className="flex gap-4">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-white text-brand-600">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">{heading}</p>
                  <p className="mt-0.5 text-sm text-muted">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-muted">© {new Date().getFullYear()} {APP_NAME}</p>
      </aside>

      <main className="flex flex-1 flex-col items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-[400px] animate-fade-in">
          <Link to="/" className="mb-10 inline-flex lg:hidden" aria-label={`${APP_NAME} home`}>
            <Logo />
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-muted">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-8 text-center text-sm text-muted">{footer}</div>}
        </div>
      </main>
    </div>
  );
}
