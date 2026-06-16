function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="h-5 w-2/3 rounded bg-surface-muted" />
        <div className="h-5 w-16 rounded-full bg-surface-muted" />
      </div>
      <div className="mt-3 h-4 w-1/2 rounded bg-surface-muted" />
      <div className="mt-2 h-4 w-3/4 rounded bg-surface-muted" />
      <div className="mt-4 flex gap-2">
        <div className="h-11 flex-1 rounded-lg bg-surface-muted" />
        <div className="h-11 flex-1 rounded-lg bg-surface-muted" />
      </div>
    </div>
  )
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse border-b border-border">
      <td className="px-4 py-4">
        <div className="h-4 w-32 rounded bg-surface-muted" />
      </td>
      <td className="px-4 py-4">
        <div className="h-4 w-16 rounded bg-surface-muted" />
      </td>
      <td className="px-4 py-4">
        <div className="h-4 w-28 rounded bg-surface-muted" />
      </td>
      <td className="px-4 py-4">
        <div className="h-5 w-16 rounded-full bg-surface-muted" />
      </td>
      <td className="px-4 py-4">
        <div className="flex justify-end gap-2">
          <div className="h-9 w-16 rounded-lg bg-surface-muted" />
          <div className="h-9 w-16 rounded-lg bg-surface-muted" />
        </div>
      </td>
    </tr>
  )
}

export default function PromotionListSkeleton() {
  return (
    <>
      <div className="space-y-3 md:hidden">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-xl border border-border md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface-muted">
              <th className="px-4 py-3 text-left text-sm font-medium text-text-muted">Campanha</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text-muted">Desconto</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text-muted">Período</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text-muted">Status</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-text-muted">Ações</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, index) => (
              <SkeletonRow key={index} />
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
