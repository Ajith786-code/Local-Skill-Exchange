import Logo from './Logo';

// Centered card used by the login and register pages.
export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-brand-50 to-slate-50 px-4 py-10">
      <div className="mb-6"><Logo /></div>
      <div className="card w-full max-w-md p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
      {footer && <p className="mt-6 text-sm text-slate-600">{footer}</p>}
    </div>
  );
}
