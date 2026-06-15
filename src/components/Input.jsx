export default function Input({ label, id, type = 'text', error, className = '', ...rest }) {
  return (
    <div className={`flex w-full flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-text">
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        className={`w-full rounded-lg border bg-surface px-4 py-3 text-base text-text outline-none transition placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 ${
          error ? 'border-danger' : 'border-border'
        }`}
        {...rest}
      />
      {error && <span className="text-sm text-danger">{error}</span>}
    </div>
  )
}
