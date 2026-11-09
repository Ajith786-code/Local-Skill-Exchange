import Modal from './Modal';

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', danger = false, loading = false, onConfirm, onCancel, children }) {
  return (
    <Modal
      open={open}
      onClose={loading ? () => {} : onCancel}
      title={title}
      size="sm"
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button type="button" className={danger ? 'btn-danger' : 'btn-primary'} onClick={onConfirm} disabled={loading}>
            {loading ? 'Please wait...' : confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-sm text-slate-600">{message}</p>
      {children}
    </Modal>
  );
}
