import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="mt-6 flex items-center justify-center gap-3">
      <button type="button" className="btn-secondary btn-sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Previous
      </button>
      <span className="text-sm text-slate-600" aria-live="polite">
        Page {page} of {totalPages}
      </span>
      <button type="button" className="btn-secondary btn-sm" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        Next <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </nav>
  );
}
