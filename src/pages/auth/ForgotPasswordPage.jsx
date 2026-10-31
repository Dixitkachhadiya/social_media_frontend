import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { authService } from '../../services/authService';
import useForm from '../../hooks/useForm';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import AuthLayout from './AuthLayout';
import FormField from '../../components/common/FormField';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { isEmail } from '../../utils/format';

const validate = ({ email }) => ({
  email: !email.trim() ? 'Email is required' : !isEmail(email.trim()) ? 'Enter a valid email address' : null,
});

// Step 1 of password recovery: POST /auth/forgot-password { email }, then enter the emailed code
export default function ForgotPasswordPage() {
  useDocumentTitle('Forgot password');
  const navigate = useNavigate();
  const { bind, errors, formError, submitting, handleSubmit } = useForm({ email: '' }, validate);

  // The backend answers the same way for registered and unregistered addresses
  const onSubmit = handleSubmit(async ({ email }) => {
    const data = await authService.forgotPassword(email.trim());
    navigate('/reset-password', {
      state: {
        email: email.trim(),
        message: data.message,
        expiresIn: data.expires_in_seconds,
        resendAfter: data.resend_after_seconds,
      },
    });
  });

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your account email and we'll send you a 6-digit code to reset it."
      footer={
        <Link to="/login" className="link inline-flex items-center gap-1.5">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to log in
        </Link>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        {formError && <Alert tone="error">{formError}</Alert>}
        <FormField label="Email" error={errors.email}>
          <input type="email" autoComplete="email" placeholder="you@example.com" {...bind('email')} />
        </FormField>
        <Button type="submit" size="lg" className="w-full" loading={submitting}>
          Send code
        </Button>
      </form>
    </AuthLayout>
  );
}
