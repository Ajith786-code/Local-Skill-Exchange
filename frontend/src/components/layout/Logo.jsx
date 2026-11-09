import { Link } from 'react-router-dom';
import { ArrowLeftRight } from 'lucide-react';

export default function Logo({ to = '/', light = false }) {
  return (
    <Link to={to} className="inline-flex items-center gap-2 font-bold" aria-label="Local Skill Exchange home">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
        <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className={light ? 'text-white' : 'text-slate-900'}>Local Skill Exchange</span>
    </Link>
  );
}
