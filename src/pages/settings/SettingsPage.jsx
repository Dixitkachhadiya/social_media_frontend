import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BadgeCheck, KeyRound, LogOut, MailWarning } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { errorMessage } from '../../utils/apiError';
import { formatDate, formatDateTime } from '../../utils/format';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import Button from '../../components/common/Button';
import ConnectionStatus from '../../components/common/ConnectionStatus';

function Section({ title, description, children }) {
  return (
    <section className="card p-5">
      <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
      {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:items-center sm:justify-between">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="text-sm text-ink">{children}</dd>
    </div>
  );
}

export default function SettingsPage() {
  useDocumentTitle('Settings');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sendingReset, setSendingReset] = useState(false);

  // There is no "change password" endpoint, so this uses the recovery flow: a code is emailed to your own address
  const sendReset = async () => {
    if (sendingReset) return;
    setSendingReset(true);
    try {
      const data = await authService.forgotPassword(user.email);
      navigate('/reset-password', {
        state: { email: user.email, message: data.message, expiresIn: data.expires_in_seconds, resendAfter: data.resend_after_seconds },
      });
    } catch (error) {
      toast.error(errorMessage(error));
      setSendingReset(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Section title="Account" description="Your sign-in details.">
        <dl className="divide-y divide-line">
          <Row label="Username">@{user.username}</Row>
          <Row label="Email">{user.email}</Row>
          <Row label="Email status">
            {user.is_email_verified ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-700">
                <BadgeCheck className="h-4 w-4" aria-hidden="true" /> Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-amber-700">
                <MailWarning className="h-4 w-4" aria-hidden="true" /> Not verified
              </span>
            )}
          </Row>
          <Row label="Role">{user.role === 'admin' ? 'Administrator' : 'Member'}</Row>
          <Row label="Member since">{formatDate(user.created_at)}</Row>
          {user.last_login_at && <Row label="Last login">{formatDateTime(user.last_login_at)}</Row>}
        </dl>
        <p className="mt-3 text-sm text-muted">
          Want to change your name, bio or photo?{' '}
          <Link to="/profile?edit=1" className="link">
            Edit your profile
          </Link>
        </p>
      </Section>

      {!user.is_email_verified && (
        <Section title="Verify your email" description="We'll email you a 6-digit code. Codes are valid for 10 minutes.">
          <Button variant="secondary" onClick={() => navigate('/verify-email')}>
            Verify email
          </Button>
        </Section>
      )}

      <Section title="Password" description="We'll email you a 6-digit code to set a new password. Changing it signs you out everywhere.">
        <Button variant="secondary" onClick={sendReset} loading={sendingReset}>
          <KeyRound className="h-4 w-4" aria-hidden="true" /> Reset password
        </Button>
      </Section>

      <Section title="System status" description="Connection to the API, database and live updates.">
        <ConnectionStatus detailed />
      </Section>

      <Section title="Session">
        <Button variant="danger-ghost" onClick={logout} className="-ml-2">
          <LogOut className="h-4 w-4" aria-hidden="true" /> Log out
        </Button>
      </Section>
    </div>
  );
}
