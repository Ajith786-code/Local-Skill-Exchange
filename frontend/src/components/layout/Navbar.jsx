import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '../../context/AuthContext';

const links = [
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/#examples', label: 'Examples' },
  { href: '/#benefits', label: 'Benefits' },
];

// Navigation bar for public pages (landing, 404).
export default function Navbar() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Logo />
        <nav className="hidden items-center gap-6 md:flex" aria-label="Main">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-slate-600 hover:text-brand-700">
              {l.label}
            </a>
          ))}
          <NavLink to="/discover" className="text-sm font-medium text-slate-600 hover:text-brand-700">
            Explore skills
          </NavLink>
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <Link to="/dashboard" className="btn-primary">Go to dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">Log in</Link>
              <Link to="/register" className="btn-primary">Get started</Link>
            </>
          )}
        </div>
        <button
          type="button"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
        </button>
      </div>
      {open && (
        <div id="mobile-menu" className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                {l.label}
              </a>
            ))}
            <Link to="/discover" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
              Explore skills
            </Link>
            <div className="mt-2 flex gap-2">
              {user ? (
                <Link to="/dashboard" className="btn-primary flex-1">Go to dashboard</Link>
              ) : (
                <>
                  <Link to="/login" className="btn-secondary flex-1">Log in</Link>
                  <Link to="/register" className="btn-primary flex-1">Get started</Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
