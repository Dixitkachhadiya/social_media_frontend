import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, MailCheck, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import useCountdown from '../../hooks/useCountdown';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { parseApiError } from '../../utils/apiError';
import { formatSeconds, maskEmail } from '../../utils/format';
import AuthLayout from './AuthLayout';
import OtpInput from '../../components/common/OtpInput';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';

/**
 * Email verification for the logged-in user:
 * intro -> POST /auth/send-verification -> enter code -> POST /auth/verify-email { otp } -> done.
 * The address is always the JWT user's own; the code is kept only in component state.
 */
export default function VerifyEmailPage() {
  useDocumentTitle('Verify email');
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [step, setStep] = useState(user?.is_email_verified ? 'done' : 'intro');
  const [otp, setOtp] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [resendIn, startResend] = useCountdown(0);
  const [expiresIn, startExpiry] = useCountdown(0);

  const masked = maskEmail(user?.email);

  const sendCode = async () => {
    if (sending) return;
    setSending(true);
    setError(null);
    try {
      const data = await authService.sendVerification();
      // The code screen opens only once the backend confirms the SMTP server accepted the email
      if (!data.email_delivered) {
        setError('We could not confirm that the email was sent. Please try again.');
        return;
      }
      startResend(data.resend_after_seconds ?? 60);
      startExpiry(data.expires_in_seconds ?? 600);
      setNotice(data.message);
      setOtp('');
      setStep('code');
    } catch (err) {
      const parsed = parseApiError(err);
      if (parsed.status === 400 && /already verified/i.test(parsed.message)) {
        await refreshUser().catch(() => {});
        setStep('done');
        return;
      }
      // Cooldown: a code was delivered less than a minute ago (failed sends are discarded by the
      // backend), so show the code screen with the remaining wait
      if (parsed.status === 429 && parsed.retryAfter) {
        startResend(parsed.retryAfter);
        if (step === 'intro') setStep('code');
      }
      setError(parsed.message);
    } finally {
      setSending(false);
    }
  };

  const verify = async (code = otp) => {
    if (verifying) return;
    if (!/^\d{6}$/.test(code)) {
      setError('Enter the 6-digit code from the email.');
      return;
    }
    setVerifying(true);
    setError(null);
    try {
      await authService.verifyEmail(code);
      await refreshUser().catch(() => {});
      setStep('done');
      toast.success('Email verified successfully');
    } catch (err) {
      setError(parseApiError(err).message);
      setOtp('');
    } finally {
      setVerifying(false);
    }
  };

  const skip = (
    <Link to="/" className="link">
      {step === 'done' ? 'Continue to your feed' : 'Skip for now'}
    </Link>
  );

  if (step === 'done') {
    return (
      <AuthLayout title="Email verified successfully" footer={skip}>
        <div className="rounded-xl border border-line p-6 text-center">
          <span className="mx-auto mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          </span>
          <p className="text-sm text-ink-soft">
            <span className="font-medium text-ink">{masked}</span> is confirmed. Thanks for securing your account.
          </p>
          <Button className="mt-5" onClick={() => navigate('/', { replace: true })}>
            Go to your feed
          </Button>
        </div>
      </AuthLayout>
    );
  }

  if (step === 'intro') {
    return (
      <AuthLayout title="Please verify your email address" subtitle="It keeps your account secure and lets you recover it if you forget your password." footer={skip}>
        <div className="rounded-xl border border-line p-5">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="text-sm text-ink-soft">
              We'll email a 6-digit code to <span className="font-medium text-ink">{masked}</span>. It's valid for 10 minutes.
            </p>
          </div>
          {error && (
            <Alert tone="error" className="mt-4">
              {error}
            </Alert>
          )}
          <Button size="lg" className="mt-5 w-full" onClick={sendCode} loading={sending}>
            Verify Email
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Enter your verification code" subtitle={`We sent a 6-digit code to ${masked}.`} footer={skip}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          verify();
        }}
        noValidate
        className="space-y-5"
      >
        {notice && !error && (
          <Alert tone="info" title="Check your inbox">
            {notice}
          </Alert>
        )}
        {error && <Alert tone="error">{error}</Alert>}

        <OtpInput value={otp} onChange={setOtp} onComplete={verify} disabled={verifying} invalid={Boolean(error)} autoFocus />

        <p className="flex items-center gap-1.5 text-xs text-muted">
          <MailCheck className="h-3.5 w-3.5" aria-hidden="true" />
          {expiresIn > 0 ? `Code expires in ${formatSeconds(expiresIn)}` : 'This code has expired. Request a new one.'}
        </p>

        <Button type="submit" size="lg" className="w-full" loading={verifying} disabled={otp.length !== 6}>
          Verify
        </Button>

        <p className="text-center text-sm text-muted">
          Didn't get it? Check your spam folder or{' '}
          {resendIn > 0 ? (
            <span className="tabular-nums">resend in {formatSeconds(resendIn)}</span>
          ) : (
            <button type="button" onClick={sendCode} disabled={sending} className="link disabled:opacity-50">
              {sending ? 'sending…' : 'resend the code'}
            </button>
          )}
        </p>
      </form>
    </AuthLayout>
  );
}
