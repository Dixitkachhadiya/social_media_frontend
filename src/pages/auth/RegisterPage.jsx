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
import { LIMITS } from '../../utils/constants';
import { isEmail } from '../../utils/format';

const validate = ({ username, email, password, confirmPassword }) => {
  const name = username.trim();
  return {
    username: !name
      ? 'Username is required'
      : name.length < LIMITS.username.min || name.length > LIMITS.username.max
        ? `Username must be between ${LIMITS.username.min} and ${LIMITS.username.max} characters`
        : null,
    email: !email.trim() ? 'Email is required' : !isEmail(email.trim()) ? 'Enter a valid email address' : null,
    password:
      password.length < LIMITS.password.min || password.length > LIMITS.password.max
        ? `Password must be between ${LIMITS.password.min} and ${LIMITS.password.max} characters`
        : null,
    confirmPassword: confirmPassword !== password ? 'Passwords do not match' : null,
  };
};

export default function RegisterPage() {
  useDocumentTitle('Create account');
  const { register } = useAuth();
  const { bind, values, errors, formError, submitting, handleSubmit } = useForm(
    { username: '', email: '', password: '', confirmPassword: '' },
    validate,
  );

  // Public registration only sends username, email and password: the role is always "user"
  // GuestRoute then redirects to the email verification screen
  const onSubmit = handleSubmit(async ({ username, email, password }) => {
    const { user } = await register({ username: username.trim(), email: email.trim(), password });
    toast.success(`Welcome, ${user.username}! Your account is ready.`);
  });

  const passwordLength = values.password.length;

  return (
    <AuthLayout
      title="Create your account"
      subtitle="It takes less than a minute."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="link">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        {formError && <Alert tone="error">{formError}</Alert>}

        <FormField label="Username" error={errors.username} hint="3–50 characters. This is how people will find you.">
          <input autoComplete="username" placeholder="e.g. priya_sharma" maxLength={LIMITS.username.max} {...bind('username')} />
        </FormField>

        <FormField label="Email" error={errors.email}>
          <input type="email" autoComplete="email" placeholder="you@example.com" {...bind('email')} />
        </FormField>

        <FormField
          label="Password"
          error={errors.password}
          hint={passwordLength ? `${passwordLength} characters (8–72)` : 'At least 8 characters'}
        >
          <PasswordInput autoComplete="new-password" placeholder="Create a password" maxLength={LIMITS.password.max} {...bind('password')} />
        </FormField>

        <FormField label="Confirm password" error={errors.confirmPassword}>
          <PasswordInput autoComplete="new-password" placeholder="Repeat your password" {...bind('confirmPassword')} />
        </FormField>

        <Button type="submit" size="lg" className="w-full" loading={submitting}>
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}
