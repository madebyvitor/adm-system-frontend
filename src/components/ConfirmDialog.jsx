import Modal from './Modal'
import Button from './Button'

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar exclusão',
  message,
  confirmLabel = 'Excluir',
  loading = false,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <div className="flex flex-col-reverse gap-3 md:flex-row md:justify-end">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-danger px-4 py-3 text-sm font-semibold text-white transition hover:bg-danger/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/30 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
          >
            {loading && (
              <span
                className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
                aria-hidden="true"
              />
            )}
            {confirmLabel}
          </button>
        </div>
      }
    >
      <p className="text-sm text-text-muted">{message}</p>
    </Modal>
  )
}
