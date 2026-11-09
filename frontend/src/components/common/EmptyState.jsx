import { Link } from 'react-router-dom';

export default function EmptyState({ icon: Icon, title, description, actionLabel, actionTo, onAction }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      {Icon && (
        <div className="mb-4 rounded-full bg-brand-50 p-3 text-brand-600">
          <Icon className="h-7 w-7" aria-hidden="true" />
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      {description && <p className="mt-1 max-w-md text-sm text-slate-500">{description}</p>}
      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn-primary mt-5">
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && (
        <button type="button" onClick={onAction} className="btn-primary mt-5">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
