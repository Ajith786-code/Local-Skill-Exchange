import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const SIZES = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' };

export default function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const previouslyFocused = document.activeElement;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    const timer = setTimeout(() => panelRef.current?.querySelector('input, select, textarea, button:not([data-close])')?.focus(), 30);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative flex max-h-[92vh] w-full ${SIZES[size] || SIZES.md} flex-col rounded-t-2xl bg-white shadow-xl sm:rounded-2xl`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button type="button" data-close onClick={onClose} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100" aria-label="Close dialog">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
}
