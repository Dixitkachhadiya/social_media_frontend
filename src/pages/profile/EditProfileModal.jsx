import { useState } from 'react';
import toast from 'react-hot-toast';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { parseApiError } from '../../utils/apiError';
import { LIMITS } from '../../utils/constants';
import { displayName, isHttpUrl } from '../../utils/format';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import FormField from '../../components/common/FormField';
import CharCount from '../../components/common/CharCount';
import Alert from '../../components/common/Alert';
import Avatar from '../../components/common/Avatar';

const OPTIONAL_FIELDS = ['full_name', 'bio', 'avatar_url', 'location', 'website'];

const urlError = (value, label) => {
  if (!value) return null;
  if (value.length > LIMITS.url) return `${label} must be at most ${LIMITS.url} characters`;
  return isHttpUrl(value) ? null : `${label} must be a valid http(s) URL`;
};

const validate = (v) => ({
  username:
    v.username.length < LIMITS.username.min || v.username.length > LIMITS.username.max
      ? `Username must be between ${LIMITS.username.min} and ${LIMITS.username.max} characters`
      : null,
  full_name: v.full_name.length > LIMITS.fullName ? `Name must be at most ${LIMITS.fullName} characters` : null,
  bio: v.bio.length > LIMITS.bio ? `Bio must be at most ${LIMITS.bio} characters` : null,
  location: v.location.length > LIMITS.location ? `Location must be at most ${LIMITS.location} characters` : null,
  avatar_url: urlError(v.avatar_url, 'Avatar URL'),
  website: urlError(v.website, 'Website'),
});

/**
 * PUT /users/profile. Only the documented fields are editable; email, role,
 * password and account status are never sent. Cleared optional fields are sent as null.
 */
export default function EditProfileModal({ account, onClose, onSaved }) {
  const { applyProfileUpdate } = useAuth();
  const initial = {
    username: account.username,
    ...Object.fromEntries(OPTIONAL_FIELDS.map((field) => [field, account.profile?.[field] ?? ''])),
  };
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);

  const trimmed = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v.trim()]));
  const changes = {};
  if (trimmed.username !== initial.username) changes.username = trimmed.username;
  for (const field of OPTIONAL_FIELDS) {
    if (trimmed[field] !== (initial[field] ?? '')) changes[field] = trimmed[field] || null;
  }
  const hasChanges = Object.keys(changes).length > 0;

  const bind = (name) => ({
    value: values[name],
    onChange: (event) => {
      setValues((v) => ({ ...v, [name]: event.target.value }));
      if (errors[name]) setErrors((e) => ({ ...e, [name]: null }));
    },
  });

  const save = async (event) => {
    event.preventDefault();
    const nextErrors = validate(trimmed);
    setErrors(nextErrors);
    setFormError(null);
    if (Object.values(nextErrors).some(Boolean) || !hasChanges) return;

    setSaving(true);
    try {
      const res = await userService.updateMyProfile(changes);
      applyProfileUpdate(res.user);
      onSaved(res.user);
      toast.success(res.message);
      onClose();
    } catch (error) {
      const parsed = parseApiError(error);
      setErrors(parsed.fieldErrors);
      setFormError(parsed.status === 409 ? null : parsed.message);
      if (parsed.status === 409) setErrors((e) => ({ ...e, username: parsed.message }));
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={saving ? undefined : onClose}
      title="Edit profile"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="edit-profile-form" loading={saving} disabled={!hasChanges}>
            Save changes
          </Button>
        </>
      }
    >
      <form id="edit-profile-form" onSubmit={save} noValidate className="space-y-4">
        {formError && <Alert tone="error">{formError}</Alert>}

        <div className="flex items-center gap-4 rounded-xl bg-slate-50 p-3">
          <Avatar src={!urlError(trimmed.avatar_url) ? trimmed.avatar_url : null} name={displayName({ full_name: trimmed.full_name, username: trimmed.username })} size="lg" />
          <p className="text-sm text-muted">Your photo comes from an image URL. Paste a link to a square image for the best result.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Name" error={errors.full_name}>
            <input autoComplete="name" placeholder="Your name" maxLength={LIMITS.fullName} {...bind('full_name')} />
          </FormField>
          <FormField label="Username" error={errors.username}>
            <input autoComplete="username" maxLength={LIMITS.username.max} {...bind('username')} />
          </FormField>
        </div>

        <FormField label="Bio" error={errors.bio} aside={<CharCount value={trimmed.bio} max={LIMITS.bio} />}>
          <textarea rows={3} placeholder="A sentence or two about you" className="input resize-y" {...bind('bio')} />
        </FormField>

        <FormField label="Avatar URL" error={errors.avatar_url}>
          <input type="url" inputMode="url" placeholder="https://example.com/me.jpg" {...bind('avatar_url')} />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Location" error={errors.location}>
            <input placeholder="City, Country" maxLength={LIMITS.location} {...bind('location')} />
          </FormField>
          <FormField label="Website" error={errors.website}>
            <input type="url" inputMode="url" placeholder="https://example.com" {...bind('website')} />
          </FormField>
        </div>

        <p className="text-xs text-muted">Your email address and password can't be changed here.</p>
      </form>
    </Modal>
  );
}
