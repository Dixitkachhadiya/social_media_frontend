const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
const dateFormat = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' });
const dateTimeFormat = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });

const UNITS = [
  ['year', 31536000],
  ['month', 2592000],
  ['week', 604800],
  ['day', 86400],
  ['hour', 3600],
  ['minute', 60],
];

export const timeAgo = (value) => {
  if (!value) return '';
  const seconds = Math.round((new Date(value).getTime() - Date.now()) / 1000);
  if (Math.abs(seconds) < 45) return 'just now';
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size || unit === 'minute') {
      return rtf.format(Math.round(seconds / size), unit);
    }
  }
  return '';
};

export const formatDate = (value) => (value ? dateFormat.format(new Date(value)) : '');
export const formatDateTime = (value) => (value ? dateTimeFormat.format(new Date(value)) : '');
export const formatCount = (value) => compact.format(value ?? 0);

export const displayName = (person) => person?.full_name || person?.profile?.full_name || person?.username || 'Unknown';

export const isHttpUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

// "priya@example.com" -> "pr***@example.com"
export const maskEmail = (email = '') => {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const visible = local.length <= 2 ? local.slice(0, 1) : local.slice(0, 2);
  return `${visible}${'*'.repeat(Math.max(3, local.length - visible.length))}@${domain}`;
};

export const formatSeconds = (total) => {
  const seconds = Math.max(0, Math.ceil(total));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
};

export const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const pluralize = (count, word, plural = `${word}s`) => `${formatCount(count)} ${count === 1 ? word : plural}`;
