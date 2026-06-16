import { useEffect, useState } from 'react'
import Button from '../components/Button'
import ConfirmDialog from '../components/ConfirmDialog'
import PromotionFormModal from '../components/PromotionFormModal'
import PromotionListSkeleton from '../components/PromotionListSkeleton'
import { useToast } from '../components/ToastContext'
import {
  createPromotion,
  deletePromotion,
  getPromotion,
  linkPromotionProducts,
  listPromotions,
  unlinkPromotionProduct,
  updatePromotion,
} from '../services/promotionsService'
import {
  formatPromotionBadge,
  formatPromotionDate,
  formatPromotionDiscount,
  getPromotionStatus,
} from '../utils/promotionHelpers'

const PAGE_LIMIT = 10

const statusStyles = {
  active: 'bg-primary/10 text-primary',
  muted: 'bg-surface-muted text-text-muted',
  danger: 'bg-danger-bg text-danger',
}

function getApiErrorMessage(error, fallback) {
  return error?.response?.data?.message ?? fallback
}

async function syncPromotionProducts(promotionId, newIds, currentIds) {
  const toAdd = newIds.filter((id) => !currentIds.includes(id))
  const toRemove = currentIds.filter((id) => !newIds.includes(id))

  await Promise.all(toRemove.map((id) => unlinkPromotionProduct(promotionId, id)))

  if (toAdd.length > 0) {
    await linkPromotionProducts(promotionId, toAdd)
  }
}

function StatusBadge({ promotion }) {
  const status = getPromotionStatus(promotion)

  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[status.variant]}`}
    >
      {status.label}
    </span>
  )
}

function PromotionCard({ promotion, onEdit, onDelete }) {
  const period = `${formatPromotionDate(promotion.start_date)} – ${formatPromotionDate(promotion.end_date)}`
  const productCount = promotion.product_count ?? promotion.products?.length

  return (
    <article className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-text">{promotion.title}</h3>
          <p className="mt-1 text-xs text-text-muted">{period}</p>
        </div>
        <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
          {formatPromotionBadge(promotion)}
        </span>
      </div>
      {promotion.description && (
        <p className="mt-2 line-clamp-2 text-sm text-text-muted">{promotion.description}</p>
      )}
      {productCount != null && (
        <p className="mt-2 text-sm text-text-muted">
          {productCount} {productCount === 1 ? 'produto' : 'produtos'}
        </p>
      )}
      <div className="mt-3 flex items-center justify-between gap-2">
        <StatusBadge promotion={promotion} />
        <div className="flex gap-2">
          <Button variant="ghost" className="!w-auto !min-h-9 px-3 py-2" onClick={() => onEdit(promotion)}>
            Editar
          </Button>
          <Button variant="ghost" className="!w-auto !min-h-9 px-3 py-2 text-danger" onClick={() => onDelete(promotion)}>
            Excluir
          </Button>
        </div>
      </div>
    </article>
  )
}

function PromotionTable({ promotions, onEdit, onDelete }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
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
          {promotions.map((promotion) => {
            const period = `${formatPromotionDate(promotion.start_date)} – ${formatPromotionDate(promotion.end_date)}`

            return (
              <tr key={promotion.id} className="border-b border-border last:border-b-0">
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-text">{promotion.title}</div>
                  {promotion.description && (
                    <div className="mt-0.5 line-clamp-1 text-xs text-text-muted">
                      {promotion.description}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-text">
                  {formatPromotionDiscount(promotion)}
                </td>
                <td className="px-4 py-3 text-sm text-text">{period}</td>
                <td className="px-4 py-3">
                  <StatusBadge promotion={promotion} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      className="!w-auto !min-h-9 px-3 py-2"
                      onClick={() => onEdit(promotion)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      className="!w-auto !min-h-9 px-3 py-2 text-danger"
                      onClick={() => onDelete(promotion)}
                    >
                      Excluir
                    </Button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default function Promotions() {
  const { showToast } = useToast()

  const [promotions, setPromotions] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [isError, setIsError] = useState(false)

  const [formOpen, setFormOpen] = useState(false)
  const [editingPromotion, setEditingPromotion] = useState(null)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingPromotion, setDeletingPromotion] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const loadPromotions = async (pageToLoad, { append = false } = {}) => {
    if (pageToLoad === 1 && !append) {
      setLoadingMore(false)
    } else {
      setLoadingMore(true)
    }

    try {
      const data = await listPromotions({ page: pageToLoad, limit: PAGE_LIMIT })
      const items = data.data ?? []
      const meta = data.meta ?? {}

      setPromotions((prev) => (append ? [...prev, ...items] : items))
      setPage(pageToLoad)
      setHasMore(meta.page < meta.lastPage)
      setIsError(false)
    } catch {
      if (pageToLoad === 1 && !append) {
        setIsError(true)
        showToast('Não foi possível carregar as promoções. Tente novamente.', 'error')
      } else {
        showToast('Não foi possível carregar mais promoções.', 'error')
      }
    } finally {
      setIsLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        const data = await listPromotions({ page: 1, limit: PAGE_LIMIT })
        if (cancelled) return

        const items = data.data ?? []
        const meta = data.meta ?? {}
        setPromotions(items)
        setPage(1)
        setHasMore(meta.page < meta.lastPage)
        setIsError(false)
      } catch {
        if (cancelled) return
        setIsError(true)
        showToast('Não foi possível carregar as promoções. Tente novamente.', 'error')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    init()

    return () => {
      cancelled = true
    }
  }, [showToast])

  const handleOpenCreate = () => {
    setEditingPromotion(null)
    setFormOpen(true)
  }

  const handleOpenEdit = (promotion) => {
    setEditingPromotion(promotion)
    setFormOpen(true)
  }

  const handleOpenDelete = (promotion) => {
    setDeletingPromotion(promotion)
    setDeleteOpen(true)
  }

  const handleSave = async ({ payload, productIds }) => {
    try {
      if (editingPromotion) {
        await updatePromotion(editingPromotion.id, payload)

        const current = await getPromotion(editingPromotion.id)
        const currentIds = (current.products ?? []).map((p) => p.id)
        await syncPromotionProducts(editingPromotion.id, productIds, currentIds)

        const updated = await getPromotion(editingPromotion.id)
        setPromotions((prev) =>
          prev.map((item) =>
            item.id === editingPromotion.id
              ? { ...item, ...updated, product_count: updated.products?.length ?? 0 }
              : item,
          ),
        )
        showToast('Promoção atualizada com sucesso.', 'success')
      } else {
        const created = await createPromotion(payload)
        setPromotions((prev) => [
          { ...created, product_count: created.products?.length ?? productIds.length },
          ...prev,
        ])
        showToast('Promoção criada com sucesso.', 'success')
      }
    } catch (error) {
      showToast(
        getApiErrorMessage(
          error,
          editingPromotion
            ? 'Não foi possível atualizar a promoção.'
            : 'Não foi possível criar a promoção.',
        ),
        'error',
      )
      throw new Error('save failed')
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingPromotion) return

    setDeleteLoading(true)

    try {
      await deletePromotion(deletingPromotion.id)
      setPromotions((prev) => prev.filter((item) => item.id !== deletingPromotion.id))
      showToast('Promoção excluída com sucesso.', 'success')
      setDeleteOpen(false)
      setDeletingPromotion(null)
    } catch (error) {
      showToast(
        getApiErrorMessage(error, 'Não foi possível excluir a promoção.'),
        'error',
      )
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleLoadMore = () => {
    if (!hasMore || loadingMore) return
    loadPromotions(page + 1, { append: true })
  }

  const handleRetry = () => {
    setIsLoading(true)
    setIsError(false)
    loadPromotions(1)
  }

  const isEmpty = !isLoading && !isError && promotions.length === 0

  return (
    <section className="pb-24 md:pb-0">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text">Promoções</h1>
          <p className="mt-1 text-sm text-text-muted">Gerencie campanhas e descontos</p>
        </div>

        <Button className="hidden md:inline-flex" onClick={handleOpenCreate}>
          + Nova Promoção
        </Button>
      </div>

      {isError && (
        <div className="mt-6 rounded-xl border border-danger/20 bg-danger-bg p-4">
          <p className="text-sm text-danger">
            Não foi possível conectar à API. Verifique se o backend está disponível.
          </p>
          <Button variant="ghost" className="mt-3 !w-auto" onClick={handleRetry}>
            Tentar novamente
          </Button>
        </div>
      )}

      {isLoading && (
        <div className="mt-6">
          <PromotionListSkeleton />
        </div>
      )}

      {isEmpty && (
        <div className="mt-6 rounded-xl border border-border bg-surface p-8 text-center">
          <p className="text-text-muted">Nenhuma promoção cadastrada ainda.</p>
          <Button className="mt-4" onClick={handleOpenCreate}>
            Adicionar a primeira promoção
          </Button>
        </div>
      )}

      {!isLoading && !isError && promotions.length > 0 && (
        <div className="mt-6 space-y-4">
          <div className="space-y-3 md:hidden">
            {promotions.map((promotion) => (
              <PromotionCard
                key={promotion.id}
                promotion={promotion}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
              />
            ))}
          </div>

          <div className="hidden md:block">
            <PromotionTable
              promotions={promotions}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
            />
          </div>

          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button
                variant="ghost"
                loading={loadingMore}
                onClick={handleLoadMore}
                className="md:w-auto"
              >
                Carregar mais
              </Button>
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={handleOpenCreate}
        className="fixed bottom-6 right-6 z-30 flex size-14 items-center justify-center rounded-full bg-primary text-2xl font-light text-white shadow-lg transition hover:bg-primary-hover md:hidden"
        aria-label="Nova promoção"
      >
        +
      </button>

      <PromotionFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        promotion={editingPromotion}
        onSave={handleSave}
      />

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => {
          if (!deleteLoading) {
            setDeleteOpen(false)
            setDeletingPromotion(null)
          }
        }}
        onConfirm={handleConfirmDelete}
        title="Excluir promoção"
        message={
          deletingPromotion
            ? `Tem certeza que deseja excluir "${deletingPromotion.title}"? Esta ação não pode ser desfeita.`
            : ''
        }
        confirmLabel="Excluir"
        loading={deleteLoading}
      />
    </section>
  )
}
