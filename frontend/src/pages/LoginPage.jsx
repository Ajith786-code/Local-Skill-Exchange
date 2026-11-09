import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import AuthShell from '../components/layout/AuthShell';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../api/axios';
import { emailRules } from '../utils/validators';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ defaultValues: { email: '', password: '' } });

  const onSubmit = async (values) => {
    setServerError('');
    try {
      const user = await login(values);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate(location.state?.from || '/dashboard', { replace: true });
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to find your next skill exchange."
      footer={<>New here? <Link to="/register" className="font-semibold text-brand-700 hover:underline">Create an account</Link></>}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {location.state?.from && <p className="rounded-lg bg-brand-50 p-3 text-sm text-brand-800">Please log in to continue.</p>}
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input id="email" type="email" autoComplete="email" className={`input ${errors.email ? 'input-error' : ''}`} aria-invalid={Boolean(errors.email)} {...register('email', emailRules)} />
          {errors.email && <p className="field-error" role="alert">{errors.email.message}</p>}
        </div>
        <div>
          <label htmlFor="password" className="label">Password</label>
          <input id="password" type="password" autoComplete="current-password" className={`input ${errors.password ? 'input-error' : ''}`} aria-invalid={Boolean(errors.password)} {...register('password', { required: 'Password is required' })} />
          {errors.password && <p className="field-error" role="alert">{errors.password.message}</p>}
        </div>
        {serverError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{serverError}</p>}
        <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>{isSubmitting ? 'Logging in...' : 'Log in'}</button>
      </form>
    </AuthShell>
  );
}
