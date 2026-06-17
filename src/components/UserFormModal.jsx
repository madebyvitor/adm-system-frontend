import { useState } from 'react'
import Modal from './Modal'
import Button from './Button'
import Input from './Input'
import { formatCpf, isValidCpf, stripCpf } from '../utils/cpfValidator'

const emptyForm = { name: '', email: '', cpf: '', password: '' }

function getInitialForm(user) {
  if (!user) return emptyForm

  return {
    name: user.name ?? '',
    email: user.email ?? '',
    cpf: formatCpf(user.cpf ?? ''),
    password: '',
  }
}

function validate(form, isEditing) {
  const errors = {}

  if (!form.name.trim()) {
    errors.name = 'Nome é obrigatório'
  }

  if (!form.email.trim()) {
    errors.email = 'E-mail é obrigatório'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = 'Informe um e-mail válido'
  }

  const cpfDigits = stripCpf(form.cpf)
  if (!cpfDigits) {
    errors.cpf = 'CPF é obrigatório'
  } else if (!isValidCpf(cpfDigits)) {
    errors.cpf = 'CPF inválido'
  }

  if (!isEditing) {
    if (!form.password) {
      errors.password = 'Senha é obrigatória'
    } else if (form.password.length < 6) {
      errors.password = 'A senha deve ter pelo menos 6 caracteres'
    }
  } else if (form.password && form.password.length < 6) {
    errors.password = 'A senha deve ter pelo menos 6 caracteres'
  }

  return errors
}

function UserFormModalContent({ user, onClose, onSave }) {
  const [form, setForm] = useState(() => getInitialForm(user))
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const isEditing = Boolean(user)

  const handleChange = (field) => (event) => {
    const value = field === 'cpf' ? formatCpf(event.target.value) : event.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const validationErrors = validate(form, isEditing)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        cpf: stripCpf(form.cpf),
      }

      if (!isEditing || form.password) {
        payload.password = form.password
      }

      await onSave(payload)
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
      title={isEditing ? 'Editar usuário' : 'Novo usuário'}
      footer={
        <div className="flex flex-col-reverse gap-3 md:flex-row md:justify-end">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" form="user-form" loading={loading}>
            {isEditing ? 'Salvar alterações' : 'Criar usuário'}
          </Button>
        </div>
      }
    >
      <form id="user-form" className="space-y-4" onSubmit={handleSubmit}>
        <Input
          id="user-name"
          label="Nome"
          value={form.name}
          onChange={handleChange('name')}
          error={errors.name}
          placeholder="Nome completo"
          required
        />

        <Input
          id="user-email"
          label="E-mail"
          type="email"
          value={form.email}
          onChange={handleChange('email')}
          error={errors.email}
          placeholder="email@exemplo.com"
          required
        />

        <Input
          id="user-cpf"
          label="CPF"
          value={form.cpf}
          onChange={handleChange('cpf')}
          error={errors.cpf}
          placeholder="000.000.000-00"
          inputMode="numeric"
          required
        />

        <Input
          id="user-password"
          label={isEditing ? 'Nova senha' : 'Senha'}
          type="password"
          value={form.password}
          onChange={handleChange('password')}
          error={errors.password}
          placeholder={isEditing ? 'Deixe em branco para manter a senha atual' : 'Mínimo 6 caracteres'}
          required={!isEditing}
        />

        {isEditing && (
          <p className="text-sm text-text-muted">
            Deixe a senha em branco para manter a senha atual.
          </p>
        )}
      </form>
    </Modal>
  )
}

export default function UserFormModal({ isOpen, onClose, user, onSave }) {
  if (!isOpen) return null

  return (
    <UserFormModalContent
      key={user?.id ?? 'new'}
      user={user}
      onClose={onClose}
      onSave={onSave}
    />
  )
}
