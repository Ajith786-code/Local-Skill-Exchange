import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorMessage({ message = 'Something went wrong.', onRetry }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-6 text-center">
      <AlertTriangle className="h-8 w-8 text-red-500" aria-hidden="true" />
      <p className="text-sm text-red-700">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-secondary btn-sm">
          <RefreshCw className="h-4 w-4" aria-hidden="true" /> Try again
        </button>
      )}
    </div>
  );
}
