import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <div className="mb-4 rounded-full bg-brand-50 p-4 text-brand-600"><Compass className="h-10 w-10" aria-hidden="true" /></div>
      <p className="text-sm font-semibold text-brand-700">404</p>
      <h1 className="mt-1 text-3xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-2 text-slate-500">The page you are looking for does not exist or may have been moved.</p>
      <div className="mt-6 flex gap-2">
        <Link to="/" className="btn-primary">Go home</Link>
        <Link to="/discover" className="btn-secondary">Find skills</Link>
      </div>
    </div>
  );
}
