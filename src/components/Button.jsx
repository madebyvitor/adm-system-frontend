const variants = {
  primary:
    'bg-primary text-white hover:bg-primary-hover focus-visible:ring-primary/30 disabled:bg-primary/60',
  ghost:
    'border border-border bg-surface text-text hover:bg-surface-muted focus-visible:ring-primary/20',
}

export default function Button({
  children,
  loading = false,
  disabled = false,
  type = 'button',
  variant = 'primary',
  className = '',
  ...rest
}) {
  const isDisabled = disabled || loading

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed md:w-auto ${variants[variant]} ${className}`}
      {...rest}
    >
      {loading && (
        <span
          className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  )
}
