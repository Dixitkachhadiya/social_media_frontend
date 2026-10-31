import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import useForm from '../../hooks/useForm';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import AuthLayout from './AuthLayout';
import FormField from '../../components/common/FormField';
import PasswordInput from '../../components/common/PasswordInput';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { isEmail } from '../../utils/format';

const validate = ({ email, password }) => ({
  email: !email.trim() ? 'Email is required' : !isEmail(email.trim()) ? 'Enter a valid email address' : null,
  password: !password ? 'Password is required' : null,
});

export default function LoginPage() {
  useDocumentTitle('Log in');
  const { login } = useAuth();
  const { bind, errors, formError, submitting, handleSubmit } = useForm({ email: '', password: '' }, validate);

  // GuestRoute redirects to the originally requested page once the session starts
  const onSubmit = handleSubmit(async ({ email, password }) => {
    const data = await login({ email: email.trim(), password });
    toast.success(`Welcome back, ${data.user.username}!`);
  });

  return (
    <AuthLayout
      title="Log in"
      subtitle="Welcome back. Enter your details to continue."
      footer={
        <>
          New here?{' '}
          <Link to="/register" className="link">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        {formError && <Alert tone="error">{formError}</Alert>}

        <FormField label="Email" error={errors.email}>
          <input type="email" autoComplete="email" placeholder="you@example.com" {...bind('email')} />
        </FormField>

        <FormField
          label="Password"
          error={errors.password}
          aside={
            <Link to="/forgot-password" className="link text-xs">
              Forgot password?
            </Link>
          }
        >
          <PasswordInput autoComplete="current-password" placeholder="Your password" {...bind('password')} />
        </FormField>

        <Button type="submit" size="lg" className="w-full" loading={submitting}>
          Log in
        </Button>
      </form>
    </AuthLayout>
  );
}
