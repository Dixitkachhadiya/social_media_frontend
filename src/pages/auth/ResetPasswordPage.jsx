import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, KeyRound, MailCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import useForm from '../../hooks/useForm';
import useCountdown from '../../hooks/useCountdown';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { parseApiError } from '../../utils/apiError';
import { LIMITS } from '../../utils/constants';
import { formatSeconds, maskEmail } from '../../utils/format';
import AuthLayout from './AuthLayout';
import OtpInput from '../../components/common/OtpInput';
import FormField from '../../components/common/FormField';
import PasswordInput from '../../components/common/PasswordInput';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';

const validatePasswords = ({ password, confirmPassword }) => ({
  password:
    password.length < LIMITS.password.min || password.length > LIMITS.password.max
      ? `Password must be between ${LIMITS.password.min} and ${LIMITS.password.max} characters`
      : null,
  confirmPassword: !confirmPassword ? 'Confirm your new password' : confirmPassword !== password ? 'Passwords do not match' : null,
});

// Step 2: POST /auth/verify-reset-otp { email, otp } -> reset_token (kept in memory only)
function CodeStep({ email, initialNotice, initialExpiresIn, initialResendAfter, onVerified }) {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(initialNotice);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendIn, startResend] = useCountdown(initialResendAfter ?? 60);
  const [expiresIn, startExpiry] = useCountdown(initialExpiresIn ?? 600);

  const verify = async (code = otp) => {
    if (verifying) return;
    if (!/^\d{6}$/.test(code)) return setError('Enter the 6-digit code from the email.');
    setVerifying(true);
    setError(null);
    try {
      const data = await authService.verifyResetOtp({ email, otp: code });
      onVerified(data.reset_token);
    } catch (err) {
      setError(parseApiError(err).message);
      setOtp('');
    } finally {
      setVerifying(false);
    }
  };

  const resend = async () => {
    if (resending) return;
    setResending(true);
    setError(null);
    try {
      const data = await authService.forgotPassword(email);
      setNotice(data.message);
      startResend(data.resend_after_seconds ?? 60);
      startExpiry(data.expires_in_seconds ?? 300);
      setOtp('');
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setResending(false);
    }
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        verify();
      }}
      noValidate
      className="space-y-5"
    >
      {notice && !error && <Alert tone="info">{notice}</Alert>}
      {error && <Alert tone="error">{error}</Alert>}

      <OtpInput value={otp} onChange={setOtp} onComplete={verify} disabled={verifying} invalid={Boolean(error)} autoFocus label="Reset code" />

      <p className="flex items-center gap-1.5 text-xs text-muted">
        <MailCheck className="h-3.5 w-3.5" aria-hidden="true" />
        {expiresIn > 0 ? `Code expires in ${formatSeconds(expiresIn)}` : 'This code has expired. Request a new one.'}
      </p>

      <Button type="submit" size="lg" className="w-full" loading={verifying} disabled={otp.length !== 6}>
        Verify code
      </Button>

      <p className="text-center text-sm text-muted">
        Didn't get it? Check your spam folder or{' '}
        {resendIn > 0 ? (
          <span className="tabular-nums">resend in {formatSeconds(resendIn)}</span>
        ) : (
          <button type="button" onClick={resend} disabled={resending} className="link disabled:opacity-50">
            {resending ? 'sending…' : 'resend the code'}
          </button>
        )}
      </p>
    </form>
  );
}

// Step 3: POST /auth/reset-password { token, password }
function PasswordStep({ resetToken, onDone, onExpired }) {
  const { bind, errors, formError, submitting, handleSubmit } = useForm({ password: '', confirmPassword: '' }, validatePasswords);

  const onSubmit = handleSubmit(async ({ password }) => {
    try {
      const data = await authService.resetPassword({ token: resetToken, password });
      onDone(data.message);
    } catch (err) {
      // The reset session is single-use and lasts 5 minutes
      if (parseApiError(err).status === 400 && /session/i.test(parseApiError(err).message)) onExpired();
      throw err;
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {formError && <Alert tone="error">{formError}</Alert>}
      <FormField label="New password" error={errors.password} hint="8–72 characters">
        <PasswordInput autoComplete="new-password" placeholder="New password" maxLength={LIMITS.password.max} autoFocus {...bind('password')} />
      </FormField>
      <FormField label="Confirm new password" error={errors.confirmPassword}>
        <PasswordInput autoComplete="new-password" placeholder="Repeat new password" {...bind('confirmPassword')} />
      </FormField>
      <Button type="submit" size="lg" className="w-full" loading={submitting}>
        <KeyRound className="h-4 w-4" aria-hidden="true" />
        Reset Password
      </Button>
    </form>
  );
}

/**
 * Password recovery after /forgot-password: enter the emailed code, then choose a new password.
 * The email arrives via router state (never storage) and the reset token stays in memory.
 */
export default function ResetPasswordPage() {
  useDocumentTitle('Reset password');
  const navigate = useNavigate();
  const { state } = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const email = state?.email;
  const [step, setStep] = useState('code');
  const [resetToken, setResetToken] = useState(null);
  const [doneMessage, setDoneMessage] = useState(null);

  // Every JWT issued before the reset is now rejected by the backend, so a logged-in user is signed
  // out here. This happens on the way to /login (not earlier): ending the session remounts the pages.
  const goToLogin = () => {
    navigate('/login', { replace: true });
    if (isAuthenticated) logout();
  };

  // Send the user to the login page shortly after a successful reset
  useEffect(() => {
    if (step !== 'done') return undefined;
    const timer = setTimeout(goToLogin, 4000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  if (!email) return <Navigate to="/forgot-password" replace />;

  const back = (
    <Link to="/forgot-password" className="link inline-flex items-center gap-1.5">
      <ArrowLeft className="h-3.5 w-3.5" /> Use a different email
    </Link>
  );

  if (step === 'done') {
    return (
      <AuthLayout title="Password reset successfully">
        <div className="rounded-xl border border-line p-6 text-center">
          <span className="mx-auto mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          </span>
          <p className="text-sm text-ink-soft">{doneMessage}</p>
          <p className="mt-2 text-xs text-muted">For your security, all of your sessions were signed out. Redirecting to log in…</p>
          <Button className="mt-5" onClick={goToLogin}>
            Log in now
          </Button>
        </div>
      </AuthLayout>
    );
  }

  if (step === 'password') {
    return (
      <AuthLayout title="Choose a new password" subtitle={`For ${maskEmail(email)}. Use at least 8 characters.`} footer={back}>
        <PasswordStep
          resetToken={resetToken}
          onExpired={() => {
            toast.error('Your reset session expired. Please verify a new code.');
            setStep('code');
          }}
          onDone={(message) => {
            setResetToken(null);
            setDoneMessage(message);
            setStep('done');
          }}
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Enter your reset code" subtitle={`If an account exists for ${maskEmail(email)}, we've emailed it a 6-digit code.`} footer={back}>
      <CodeStep
        email={email}
        initialNotice={state?.message}
        initialExpiresIn={state?.expiresIn}
        initialResendAfter={state?.resendAfter}
        onVerified={(token) => {
          setResetToken(token);
          setStep('password');
        }}
      />
    </AuthLayout>
  );
}
