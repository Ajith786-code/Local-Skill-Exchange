import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Trash2 } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import SkillEditor from '../components/skills/SkillEditor';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useAuth } from '../context/AuthContext';
import * as userApi from '../api/userApi';
import * as skillApi from '../api/skillApi';
import { getErrorMessage } from '../api/axios';
import { MODES } from '../utils/constants';

export default function EditProfilePage() {
  const { user, setUser, clearSession } = useAuth();
  const navigate = useNavigate();
  const [offered, setOffered] = useState(user.offeredSkills);
  const [wanted, setWanted] = useState(user.wantedSkills);
  const [suggestions, setSuggestions] = useState([]);
  const [serverError, setServerError] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting, isDirty } } = useForm({
    defaultValues: { name: user.name, city: user.city, bio: user.bio, avatar: user.avatar, learningMode: user.learningMode, availability: user.availability },
  });
  const bio = watch('bio') || '';

  useEffect(() => {
    skillApi.listSkills({ limit: 100 }).then((d) => setSuggestions(d.items)).catch(() => {});
  }, []);

  const skillsChanged = JSON.stringify(offered) !== JSON.stringify(user.offeredSkills) || JSON.stringify(wanted) !== JSON.stringify(user.wantedSkills);

  const onSubmit = async (values) => {
    setServerError('');
    const strip = (list) => list.map(({ name, category, level }) => ({ name, category, level }));
    try {
      const data = await userApi.updateMe({ ...values, offeredSkills: strip(offered), wantedSkills: strip(wanted) });
      setUser(data.user);
      toast.success('Profile saved');
      navigate('/profile');
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      await userApi.deleteMe(deletePassword);
      toast.success('Your account has been deleted');
      clearSession();
      navigate('/', { replace: true });
    } catch (err) {
      setDeleteError(getErrorMessage(err));
      setDeleting(false);
    }
  };

  return (
    <>
      <PageHeader title="Edit profile" subtitle="Keep your skills up to date to get better matches." />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <section className="card space-y-4 p-5" aria-label="Basic information">
          <h2 className="font-semibold text-slate-900">Basic information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="label">Full name</label>
              <input id="name" className={`input ${errors.name ? 'input-error' : ''}`} {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'At least 2 characters' }, maxLength: { value: 60, message: 'At most 60 characters' } })} />
              {errors.name && <p className="field-error" role="alert">{errors.name.message}</p>}
            </div>
            <div>
              <label htmlFor="city" className="label">City</label>
              <input id="city" className={`input ${errors.city ? 'input-error' : ''}`} {...register('city', { required: 'City is required', minLength: { value: 2, message: 'At least 2 characters' }, maxLength: { value: 60, message: 'At most 60 characters' } })} />
              {errors.city && <p className="field-error" role="alert">{errors.city.message}</p>}
            </div>
          </div>
          <div>
            <label htmlFor="bio" className="label">Short bio</label>
            <textarea id="bio" rows={4} className={`input ${errors.bio ? 'input-error' : ''}`} placeholder="Tell people a little about yourself..." {...register('bio', { maxLength: { value: 500, message: 'At most 500 characters' } })} />
            <p className="mt-1 text-right text-xs text-slate-400">{bio.length}/500</p>
            {errors.bio && <p className="field-error" role="alert">{errors.bio.message}</p>}
          </div>
          <div>
            <label htmlFor="avatar" className="label">Profile picture URL (optional)</label>
            <input id="avatar" type="url" placeholder="https://example.com/me.jpg" className={`input ${errors.avatar ? 'input-error' : ''}`} {...register('avatar', { pattern: { value: /^$|^https?:\/\/\S+$/i, message: 'Enter a valid http(s) image URL' }, maxLength: { value: 500, message: 'URL is too long' } })} />
            {errors.avatar && <p className="field-error" role="alert">{errors.avatar.message}</p>}
            <p className="mt-1 text-xs text-slate-500">Image uploads are not configured, so paste a link to a hosted image. Initials are shown when empty.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="learningMode" className="label">Preferred learning mode</label>
              <select id="learningMode" className="input" {...register('learningMode')}>
                {MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="availability" className="label">Availability</label>
              <input id="availability" className="input" placeholder="e.g. Weekday evenings, Sundays" {...register('availability', { maxLength: { value: 200, message: 'At most 200 characters' } })} />
              {errors.availability && <p className="field-error" role="alert">{errors.availability.message}</p>}
            </div>
          </div>
        </section>

        <SkillEditor kind="offered" title="Skills I can teach" description="Add skills you are happy to teach, with your experience level." skills={offered} onChange={setOffered} suggestions={suggestions} />
        <SkillEditor kind="wanted" title="Skills I want to learn" description="Add skills you would like to learn. Level means your current level." skills={wanted} onChange={setWanted} suggestions={suggestions} />

        {serverError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{serverError}</p>}
        <div className="flex flex-wrap gap-2">
          <button type="submit" className="btn-primary" disabled={isSubmitting || (!isDirty && !skillsChanged)}>{isSubmitting ? 'Saving...' : 'Save changes'}</button>
          <button type="button" className="btn-secondary" onClick={() => navigate('/profile')}>Cancel</button>
        </div>
      </form>

      <section className="mt-10 rounded-xl border border-red-200 bg-red-50 p-5" aria-label="Danger zone">
        <h2 className="font-semibold text-red-800">Delete account</h2>
        <p className="mt-1 text-sm text-red-700">This permanently deletes your profile, exchange requests, messages and notifications. This cannot be undone.</p>
        <button type="button" className="btn-danger mt-4" onClick={() => { setDeleteOpen(true); setDeletePassword(''); setDeleteError(''); }}>
          <Trash2 className="h-4 w-4" aria-hidden="true" /> Delete my account
        </button>
      </section>

      <ConfirmDialog open={deleteOpen} title="Delete your account?" message="Enter your password to confirm. All your data will be removed." confirmLabel="Delete permanently" danger loading={deleting} onConfirm={confirmDelete} onCancel={() => setDeleteOpen(false)}>
        <label htmlFor="delete-password" className="label mt-4">Password</label>
        <input id="delete-password" type="password" autoComplete="current-password" className="input" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} />
        {deleteError && <p role="alert" className="field-error">{deleteError}</p>}
      </ConfirmDialog>
    </>
  );
}
