import { useEffect, useState } from 'react'
import Modal from './Modal'
import Button from './Button'
import Input from './Input'
import { listProducts } from '../services/productsService'
import { buildPromotionPayload, getPromotion } from '../services/promotionsService'
import {
  fromApiDateTime,
  isDateBeforeToday,
  toApiDateTime,
} from '../utils/promotionHelpers'

const emptyForm = {
  title: '',
  description: '',
  discount_percentage: '',
  start_date: '',
  end_date: '',
}

function getInitialForm(promotion) {
  if (!promotion) return emptyForm

  return {
    title: promotion.title ?? '',
    description: promotion.description ?? '',
    discount_percentage: String(promotion.discount_value ?? promotion.discount_percentage ?? ''),
    start_date: fromApiDateTime(promotion.start_date),
    end_date: fromApiDateTime(promotion.end_date),
  }
}

function validate(form, isEditing) {
  const errors = {}

  if (!form.title.trim()) {
    errors.title = 'Título é obrigatório'
  }

  const discount = Number(form.discount_percentage)
  if (form.discount_percentage === '' || Number.isNaN(discount) || discount <= 0) {
    errors.discount_percentage = 'Informe um valor válido'
  } else if (discount > 100) {
    errors.discount_percentage = 'O percentual deve ser no máximo 100'
  }

  if (!form.start_date) {
    errors.start_date = 'Data de início é obrigatória'
  } else if (!isEditing && isDateBeforeToday(form.start_date)) {
    errors.start_date = 'A data de início não pode ser no passado'
  }

  if (!form.end_date) {
    errors.end_date = 'Data de término é obrigatória'
  } else if (form.start_date) {
    const start = toApiDateTime(form.start_date)
    const end = toApiDateTime(form.end_date, true)
    if (end <= start) {
      errors.end_date = 'A data de término deve ser posterior à data de início'
    }
  }

  return errors
}

async function loadAllProducts() {
  const allProducts = []
  let page = 1
  let lastPage = 1

  do {
    const data = await listProducts({ page, limit: 100 })
    const items = data.data ?? []
    const meta = data.meta ?? {}
    allProducts.push(...items)
    lastPage = meta.lastPage ?? 1
    page += 1
  } while (page <= lastPage)

  return allProducts
}

function PromotionFormModalContent({ promotion, onClose, onSave }) {
  const [form, setForm] = useState(() => getInitialForm(promotion))
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [productsLoading, setProductsLoading] = useState(true)
  const [availableProducts, setAvailableProducts] = useState([])
  const [selectedProductIds, setSelectedProductIds] = useState([])

  const isEditing = Boolean(promotion)

  useEffect(() => {
    let cancelled = false

    async function init() {
      setProductsLoading(true)

      try {
        const products = await loadAllProducts()
        if (cancelled) return
        setAvailableProducts(products)

        if (promotion) {
          const detail = await getPromotion(promotion.id)
          if (cancelled) return
          const linkedIds = (detail.products ?? []).map((p) => p.id)
          setSelectedProductIds(linkedIds)
        }
      } catch {
        if (!cancelled) {
          setErrors((prev) => ({ ...prev, products: 'Não foi possível carregar os produtos.' }))
        }
      } finally {
        if (!cancelled) setProductsLoading(false)
      }
    }

    init()

    return () => {
      cancelled = true
    }
  }, [promotion])

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleProductToggle = (productId) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    )
    setErrors((prev) => ({ ...prev, products: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const validationErrors = validate(form, isEditing)

    if (selectedProductIds.length === 0) {
      validationErrors.products = 'Selecione pelo menos um produto'
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)

    try {
      const payload = buildPromotionPayload(form, selectedProductIds, {
        includeProducts: !isEditing,
      })
      await onSave({ payload, productIds: selectedProductIds })
      onClose()
    } catch {
      // Error handling is done by the parent via toast
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isEditing ? 'Editar promoção' : 'Nova promoção'}
      footer={
        <div className="flex flex-col-reverse gap-3 md:flex-row md:justify-end">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" form="promotion-form" loading={loading}>
            {isEditing ? 'Salvar alterações' : 'Criar promoção'}
          </Button>
        </div>
      }
    >
      <form id="promotion-form" className="space-y-4" onSubmit={handleSubmit}>
        <Input
          id="promotion-title"
          label="Título"
          value={form.title}
          onChange={handleChange('title')}
          error={errors.title}
          placeholder="Ex: Black Friday"
          required
        />

        <div className="flex w-full flex-col gap-1.5">
          <label htmlFor="promotion-description" className="text-sm font-medium text-text">
            Descrição
          </label>
          <textarea
            id="promotion-description"
            value={form.description}
            onChange={handleChange('description')}
            placeholder="Descrição da campanha (opcional)"
            rows={3}
            className="w-full resize-none rounded-lg border border-border bg-surface px-4 py-3 text-base text-text outline-none transition placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <Input
          id="promotion-discount"
          label="Percentual (%)"
          type="number"
          step="0.1"
          min="0"
          max="100"
          value={form.discount_percentage}
          onChange={handleChange('discount_percentage')}
          error={errors.discount_percentage}
          placeholder="0"
          required
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            id="promotion-start-date"
            label="Data de início"
            type="date"
            value={form.start_date}
            onChange={handleChange('start_date')}
            error={errors.start_date}
            required
          />

          <Input
            id="promotion-end-date"
            label="Data de término"
            type="date"
            value={form.end_date}
            onChange={handleChange('end_date')}
            error={errors.end_date}
            required
          />
        </div>

        <div className="flex w-full flex-col gap-1.5">
          <span className="text-sm font-medium text-text">Produtos participantes</span>
          {productsLoading ? (
            <p className="text-sm text-text-muted">Carregando produtos...</p>
          ) : availableProducts.length === 0 ? (
            <p className="text-sm text-text-muted">Nenhum produto cadastrado.</p>
          ) : (
            <div
              className={`max-h-48 overflow-y-auto rounded-lg border bg-surface p-3 ${
                errors.products ? 'border-danger' : 'border-border'
              }`}
            >
              <div className="space-y-2">
                {availableProducts.map((product) => (
                  <label
                    key={product.id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 transition hover:bg-surface-muted"
                  >
                    <input
                      type="checkbox"
                      checked={selectedProductIds.includes(product.id)}
                      onChange={() => handleProductToggle(product.id)}
                      className="size-4 rounded border-border text-primary focus:ring-primary/20"
                    />
                    <span className="text-sm text-text">{product.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          {errors.products && <span className="text-sm text-danger">{errors.products}</span>}
        </div>
      </form>
    </Modal>
  )
}

export default function PromotionFormModal({ isOpen, onClose, promotion, onSave }) {
  if (!isOpen) return null

  return (
    <PromotionFormModalContent
      key={promotion?.id ?? 'new'}
      promotion={promotion}
      onClose={onClose}
      onSave={onSave}
    />
  )
}
