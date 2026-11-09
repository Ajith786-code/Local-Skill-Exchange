import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ label = 'Loading...', fullPage = false, className = '' }) {
  const spinner = (
    <div role="status" className={`flex items-center justify-center gap-2 text-slate-500 ${className}`}>
      <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
      <span className="text-sm">{label}</span>
    </div>
  );
  if (fullPage) return <div className="flex min-h-screen items-center justify-center">{spinner}</div>;
  return <div className="py-10">{spinner}</div>;
}
