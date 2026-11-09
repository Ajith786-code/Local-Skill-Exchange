import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import AuthShell from '../components/layout/AuthShell';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../api/axios';
import { emailRules, validatePassword } from '../utils/validators';

export default function RegisterPage() {
  const { register: signUp } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { name: '', email: '', city: '', password: '', confirm: '' },
  });

  const onSubmit = async ({ confirm, ...values }) => {
    setServerError('');
    try {
      await signUp(values);
      toast.success('Account created! Let’s set up your skills.');
      navigate('/profile/edit', { replace: true });
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  };

  const field = (name, label, props = {}, rules = {}) => (
    <div>
      <label htmlFor={name} className="label">{label}</label>
      <input id={name} className={`input ${errors[name] ? 'input-error' : ''}`} aria-invalid={Boolean(errors[name])} {...props} {...register(name, rules)} />
      {errors[name] && <p className="field-error" role="alert">{errors[name].message}</p>}
    </div>
  );

  return (
    <AuthShell
      title="Create your account"
      subtitle="Free forever. Exchange skills, not money."
      footer={<>Already have an account? <Link to="/login" className="font-semibold text-brand-700 hover:underline">Log in</Link></>}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {field('name', 'Full name', { autoComplete: 'name' }, {
          required: 'Name is required',
          minLength: { value: 2, message: 'Name must be at least 2 characters' },
          maxLength: { value: 60, message: 'Name must be 60 characters or fewer' },
          setValueAs: (v) => v.trim(),
        })}
        {field('email', 'Email', { type: 'email', autoComplete: 'email' }, emailRules)}
        {field('city', 'City', { autoComplete: 'address-level2', placeholder: 'e.g. Vijayawada' }, {
          required: 'City is required',
          minLength: { value: 2, message: 'City must be at least 2 characters' },
          maxLength: { value: 60, message: 'City must be 60 characters or fewer' },
          setValueAs: (v) => v.trim(),
        })}
        {field('password', 'Password', { type: 'password', autoComplete: 'new-password' }, { validate: validatePassword })}
        <p className="-mt-2 text-xs text-slate-500">At least 8 characters with upper and lower case letters, a number and a special character.</p>
        {field('confirm', 'Confirm password', { type: 'password', autoComplete: 'new-password' }, {
          required: 'Please confirm your password',
          validate: (v) => v === watch('password') || 'Passwords do not match',
        })}
        {serverError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{serverError}</p>}
        <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>{isSubmitting ? 'Creating account...' : 'Create account'}</button>
      </form>
    </AuthShell>
  );
}
