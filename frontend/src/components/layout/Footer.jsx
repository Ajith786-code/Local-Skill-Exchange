import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-slate-500">
            A community platform for exchanging skills without money. Teach what you know, learn what you want.
          </p>
        </div>
        <nav aria-label="Platform">
          <h2 className="text-sm font-semibold text-slate-900">Platform</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li><Link className="hover:text-brand-700" to="/discover">Find skills</Link></li>
            <li><Link className="hover:text-brand-700" to="/matches">Matches</Link></li>
            <li><Link className="hover:text-brand-700" to="/requests">Exchange requests</Link></li>
            <li><Link className="hover:text-brand-700" to="/messages">Messages</Link></li>
          </ul>
        </nav>
        <nav aria-label="Account">
          <h2 className="text-sm font-semibold text-slate-900">Account</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li><Link className="hover:text-brand-700" to="/register">Create an account</Link></li>
            <li><Link className="hover:text-brand-700" to="/login">Log in</Link></li>
            <li><Link className="hover:text-brand-700" to="/profile">My profile</Link></li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Local Skill Exchange. Contact details are never shared publicly.
      </div>
    </footer>
  );
}
