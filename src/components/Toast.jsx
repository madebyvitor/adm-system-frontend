const styles = {
  info: 'border-border bg-surface text-text',
  error: 'border-danger bg-danger-bg text-danger',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
}

export default function Toast({ message, type = 'info', onClose }) {
  return (
    <div
      role="alert"
      className={`pointer-events-auto flex items-start justify-between gap-3 rounded-lg border px-4 py-3 shadow-lg ${styles[type] ?? styles.info}`}
    >
      <p className="text-sm font-medium">{message}</p>
      <button
        type="button"
        onClick={onClose}
        className="shrink-0 text-sm opacity-70 transition hover:opacity-100"
        aria-label="Fechar notificação"
      >
        ×
      </button>
    </div>
  )
}
