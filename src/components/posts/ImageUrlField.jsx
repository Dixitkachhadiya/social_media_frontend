import { useState } from 'react';
import { ImageOff, X } from 'lucide-react';
import { LIMITS } from '../../utils/constants';
import { isHttpUrl } from '../../utils/format';

// The backend stores an image *URL* (http/https, ≤500 chars); there is no file upload endpoint
export const validateImageUrl = (value) => {
  const url = value.trim();
  if (!url) return null;
  if (url.length > LIMITS.url) return `Image URL must be at most ${LIMITS.url} characters`;
  if (!isHttpUrl(url)) return 'Enter a valid http(s) image URL';
  return null;
};

export default function ImageUrlField({ value, onChange, error, onRemove }) {
  const [failedUrl, setFailedUrl] = useState(null);
  const url = value.trim();
  const canPreview = url && !validateImageUrl(url);

  return (
    <div className="rounded-xl border border-line bg-slate-50/60 p-3">
      <div className="flex items-center gap-2">
        <label htmlFor="post-image-url" className="sr-only">
          Image URL
        </label>
        <input
          id="post-image-url"
          type="url"
          inputMode="url"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="https://example.com/photo.jpg"
          className={`input ${error ? 'input-error' : ''}`}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'post-image-url-error' : 'post-image-url-hint'}
        />
        {onRemove && (
          <button type="button" onClick={onRemove} className="rounded-md p-2 text-muted hover:bg-white hover:text-ink" aria-label="Remove image">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {error ? (
        <p id="post-image-url-error" className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      ) : (
        <p id="post-image-url-hint" className="mt-1.5 text-xs text-muted">
          Paste a link to an image hosted online. File uploads aren't supported yet.
        </p>
      )}

      {canPreview &&
        (failedUrl === url ? (
          <p className="mt-3 flex items-center gap-2 text-xs text-amber-700">
            <ImageOff className="h-3.5 w-3.5" aria-hidden="true" /> We couldn't load a preview from this URL. Check that it points to an image.
          </p>
        ) : (
          <div className="mt-3 overflow-hidden rounded-lg border border-line bg-white">
            <img src={url} alt="Preview of the attached image" className="max-h-64 w-full object-cover" onError={() => setFailedUrl(url)} />
          </div>
        ))}
    </div>
  );
}
