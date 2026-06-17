import { useState } from 'react'
import Modal from './Modal'
import Button from './Button'
import Input from './Input'

const emptyForm = { name: '', price: '', quantity: '' }

function getInitialForm(product) {
  if (!product) return emptyForm

  return {
    name: product.name ?? '',
    price: String(product.price ?? ''),
    quantity: String(product.quantity ?? ''),
  }
}

function validate(form) {
  const errors = {}

  if (!form.name.trim()) {
    errors.name = 'Nome é obrigatório'
  }

  const price = Number(form.price)
  if (form.price === '' || Number.isNaN(price) || price < 0) {
    errors.price = 'Informe um preço válido'
  }

  const quantity = Number(form.quantity)
  if (form.quantity === '' || Number.isNaN(quantity) || quantity < 0 || !Number.isInteger(quantity)) {
    errors.quantity = 'Informe uma quantidade válida'
  }

  return errors
}

function ProductFormModalContent({ product, onClose, onSave }) {
  const [form, setForm] = useState(() => getInitialForm(product))
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const isEditing = Boolean(product)

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const validationErrors = validate(form)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)

    try {
      await onSave({
        name: form.name.trim(),
        price: Number(form.price),
        quantity: Number(form.quantity),
      })
      onClose()
    } catch {
      
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isEditing ? 'Editar produto' : 'Novo produto'}
      footer={
        <div className="flex flex-col-reverse gap-3 md:flex-row md:justify-end">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" form="product-form" loading={loading}>
            {isEditing ? 'Salvar alterações' : 'Criar produto'}
          </Button>
        </div>
      }
    >
      <form id="product-form" className="space-y-4" onSubmit={handleSubmit}>
        <Input
          id="product-name"
          label="Nome"
          value={form.name}
          onChange={handleChange('name')}
          error={errors.name}
          placeholder="Nome do produto"
          required
        />

        <Input
          id="product-price"
          label="Preço"
          type="number"
          step="0.01"
          min="0"
          value={form.price}
          onChange={handleChange('price')}
          error={errors.price}
          placeholder="0,00"
          required
        />

        <Input
          id="product-stock"
          label="Quantidade em estoque"
          type="number"
          step="1"
          min="0"
          value={form.quantity}
          onChange={handleChange('quantity')}
          error={errors.quantity}
          placeholder="0"
          required
        />
      </form>
    </Modal>
  )
}

export default function ProductFormModal({ isOpen, onClose, product, onSave }) {
  if (!isOpen) return null

  return (
    <ProductFormModalContent
      key={product?.id ?? 'new'}
      product={product}
      onClose={onClose}
      onSave={onSave}
    />
  )
}
