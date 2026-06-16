import { useEffect, useState } from 'react'
import Button from '../components/Button'
import ConfirmDialog from '../components/ConfirmDialog'
import ProductFormModal from '../components/ProductFormModal'
import ProductListSkeleton from '../components/ProductListSkeleton'
import { useToast } from '../components/ToastContext'
import {
  createProduct,
  deleteProduct,
  listProducts,
  updateProduct,
} from '../services/productsService'

const PAGE_LIMIT = 10

const priceFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

function ProductCard({ product, onEdit, onDelete }) {
  return (
    <article className="rounded-xl border border-border bg-surface p-4">
      <h3 className="font-semibold text-text">{product.name}</h3>
      <p className="mt-1 text-sm text-text-muted">
        {priceFormatter.format(product.price)} · Estoque: {product.quantity}
      </p>
      <div className="mt-4 flex gap-2">
        <Button variant="ghost" className="flex-1" onClick={() => onEdit(product)}>
          Editar
        </Button>
        <Button variant="ghost" className="flex-1 text-danger" onClick={() => onDelete(product)}>
          Excluir
        </Button>
      </div>
    </article>
  )
}

function ProductTable({ products, onEdit, onDelete }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-surface-muted">
            <th className="px-4 py-3 text-left text-sm font-medium text-text-muted">Nome</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-text-muted">Preço</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-text-muted">Estoque</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-text-muted">Ações</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b border-border last:border-b-0">
              <td className="px-4 py-3 text-sm text-text">{product.name}</td>
              <td className="px-4 py-3 text-sm text-text">
                {priceFormatter.format(product.price)}
              </td>
              <td className="px-4 py-3 text-sm text-text">{product.quantity}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" className="!w-auto !min-h-9 px-3 py-2" onClick={() => onEdit(product)}>
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    className="!w-auto !min-h-9 px-3 py-2 text-danger"
                    onClick={() => onDelete(product)}
                  >
                    Excluir
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function Products() {
  const { showToast } = useToast()

  const [products, setProducts] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [isError, setIsError] = useState(false)

  const [formOpen, setFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingProduct, setDeletingProduct] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const loadProducts = async (pageToLoad, { append = false } = {}) => {
    if (pageToLoad === 1 && !append) {
      setLoadingMore(false)
    } else {
      setLoadingMore(true)
    }

    try {
      const data = await listProducts({ page: pageToLoad, limit: PAGE_LIMIT })
      const items = data.data ?? []
      const meta = data.meta ?? {}

      setProducts((prev) => (append ? [...prev, ...items] : items))
      setPage(pageToLoad)
      setHasMore(meta.page < meta.lastPage)
      setIsError(false)
    } catch {
      if (pageToLoad === 1 && !append) {
        setIsError(true)
        showToast('Não foi possível carregar os produtos. Tente novamente.', 'error')
      } else {
        showToast('Não foi possível carregar mais produtos.', 'error')
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
        const data = await listProducts({ page: 1, limit: PAGE_LIMIT })
        if (cancelled) return

        const items = data.data ?? []
        const meta = data.meta ?? {}
        setProducts(items)
        setPage(1)
        setHasMore(meta.page < meta.lastPage)
        setIsError(false)
      } catch {
        if (cancelled) return
        setIsError(true)
        showToast('Não foi possível carregar os produtos. Tente novamente.', 'error')
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
    setEditingProduct(null)
    setFormOpen(true)
  }

  const handleOpenEdit = (product) => {
    setEditingProduct(product)
    setFormOpen(true)
  }

  const handleOpenDelete = (product) => {
    setDeletingProduct(product)
    setDeleteOpen(true)
  }

  const handleSave = async (payload) => {
    try {
      if (editingProduct) {
        const updated = await updateProduct(editingProduct.id, payload)
        setProducts((prev) =>
          prev.map((item) => (item.id === editingProduct.id ? { ...item, ...updated } : item)),
        )
        showToast('Produto atualizado com sucesso.', 'success')
      } else {
        const created = await createProduct(payload)
        setProducts((prev) => [created, ...prev])
        showToast('Produto criado com sucesso.', 'success')
      }
    } catch {
      showToast(
        editingProduct
          ? 'Não foi possível atualizar o produto.'
          : 'Não foi possível criar o produto.',
        'error',
      )
      throw new Error('save failed')
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingProduct) return

    setDeleteLoading(true)

    try {
      await deleteProduct(deletingProduct.id)
      setProducts((prev) => prev.filter((item) => item.id !== deletingProduct.id))
      showToast('Produto excluído com sucesso.', 'success')
      setDeleteOpen(false)
      setDeletingProduct(null)
    } catch {
      showToast('Não foi possível excluir o produto.', 'error')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleLoadMore = () => {
    if (!hasMore || loadingMore) return
    loadProducts(page + 1, { append: true })
  }

  const handleRetry = () => {
    setIsLoading(true)
    setIsError(false)
    loadProducts(1)
  }

  const isEmpty = !isLoading && !isError && products.length === 0

  return (
    <section className="pb-24 md:pb-0">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text">Produtos</h1>
          <p className="mt-1 text-sm text-text-muted">Gerencie o catálogo de produtos</p>
        </div>

        <Button className="hidden md:inline-flex" onClick={handleOpenCreate}>
          + Novo Produto
        </Button>
      </div>

      {isError && (
        <div className="mt-6 rounded-xl border border-danger/20 bg-danger-bg p-4">
          <p className="text-sm text-danger">
            Não foi possível conectar à API. Verifique se o backend está disponível.
          </p>
          <Button
            variant="ghost"
            className="mt-3 !w-auto"
            onClick={handleRetry}
          >
            Tentar novamente
          </Button>
        </div>
      )}

      {isLoading && (
        <div className="mt-6">
          <ProductListSkeleton />
        </div>
      )}

      {isEmpty && (
        <div className="mt-6 rounded-xl border border-border bg-surface p-8 text-center">
          <p className="text-text-muted">Nenhum produto cadastrado ainda.</p>
          <Button className="mt-4" onClick={handleOpenCreate}>
            Adicionar o primeiro produto
          </Button>
        </div>
      )}

      {!isLoading && !isError && products.length > 0 && (
        <div className="mt-6 space-y-4">
          <div className="space-y-3 md:hidden">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
              />
            ))}
          </div>

          <div className="hidden md:block">
            <ProductTable
              products={products}
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
        aria-label="Novo produto"
      >
        +
      </button>

      <ProductFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        product={editingProduct}
        onSave={handleSave}
      />

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => {
          if (!deleteLoading) {
            setDeleteOpen(false)
            setDeletingProduct(null)
          }
        }}
        onConfirm={handleConfirmDelete}
        title="Excluir produto"
        message={
          deletingProduct
            ? `Tem certeza que deseja excluir "${deletingProduct.name}"? Esta ação não pode ser desfeita.`
            : ''
        }
        confirmLabel="Excluir"
        loading={deleteLoading}
      />
    </section>
  )
}
