import { useEffect, useState } from 'react'
import Button from '../components/Button'
import ConfirmDialog from '../components/ConfirmDialog'
import UserFormModal from '../components/UserFormModal'
import UserListSkeleton from '../components/UserListSkeleton'
import { useToast } from '../components/ToastContext'
import { useAuth } from '../context/AuthContext'
import { formatCpf } from '../utils/cpfValidator'
import {
  createUser,
  deleteUser,
  listUsers,
  updateUser,
} from '../services/usersService'

const PAGE_LIMIT = 10

const roleLabels = {
  admin: 'Administrador',
  employee: 'Funcionário',
}

function getRoleLabel(role) {
  return roleLabels[role] ?? role
}

function UserCard({ user, currentUserId, onEdit, onDelete }) {
  const isSelf = user.id === currentUserId

  return (
    <article className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-text">{user.name}</h3>
        <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
          {getRoleLabel(user.role)}
        </span>
      </div>
      <p className="mt-1 text-sm text-text-muted">{user.email}</p>
      <p className="mt-1 text-sm text-text-muted">{formatCpf(user.cpf)}</p>
      <div className="mt-4 flex gap-2">
        <Button variant="ghost" className="flex-1" onClick={() => onEdit(user)}>
          Editar
        </Button>
        <Button
          variant="ghost"
          className="flex-1 text-danger"
          onClick={() => onDelete(user)}
          disabled={isSelf}
        >
          Excluir
        </Button>
      </div>
    </article>
  )
}

function UserTable({ users, currentUserId, onEdit, onDelete }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-surface-muted">
            <th className="px-4 py-3 text-left text-sm font-medium text-text-muted">Nome</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-text-muted">E-mail</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-text-muted">CPF</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-text-muted">Perfil</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-text-muted">Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const isSelf = user.id === currentUserId

            return (
              <tr key={user.id} className="border-b border-border last:border-b-0">
                <td className="px-4 py-3 text-sm text-text">{user.name}</td>
                <td className="px-4 py-3 text-sm text-text">{user.email}</td>
                <td className="px-4 py-3 text-sm text-text">{formatCpf(user.cpf)}</td>
                <td className="px-4 py-3 text-sm text-text">{getRoleLabel(user.role)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      className="!w-auto !min-h-9 px-3 py-2"
                      onClick={() => onEdit(user)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      className="!w-auto !min-h-9 px-3 py-2 text-danger"
                      onClick={() => onDelete(user)}
                      disabled={isSelf}
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

function getApiErrorMessage(error, fallback) {
  return error?.response?.data?.message ?? fallback
}

export default function Users() {
  const { showToast } = useToast()
  const { user: currentUser } = useAuth()

  const [users, setUsers] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [isError, setIsError] = useState(false)

  const [formOpen, setFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingUser, setDeletingUser] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const loadUsers = async (pageToLoad, { append = false } = {}) => {
    if (pageToLoad === 1 && !append) {
      setLoadingMore(false)
    } else {
      setLoadingMore(true)
    }

    try {
      const data = await listUsers({ page: pageToLoad, limit: PAGE_LIMIT })
      const items = data.data ?? []
      const meta = data.meta ?? {}

      setUsers((prev) => (append ? [...prev, ...items] : items))
      setPage(pageToLoad)
      setHasMore(meta.page < meta.lastPage)
      setIsError(false)
    } catch {
      if (pageToLoad === 1 && !append) {
        setIsError(true)
        showToast('Não foi possível carregar os usuários. Tente novamente.', 'error')
      } else {
        showToast('Não foi possível carregar mais usuários.', 'error')
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
        const data = await listUsers({ page: 1, limit: PAGE_LIMIT })
        if (cancelled) return

        const items = data.data ?? []
        const meta = data.meta ?? {}
        setUsers(items)
        setPage(1)
        setHasMore(meta.page < meta.lastPage)
        setIsError(false)
      } catch {
        if (cancelled) return
        setIsError(true)
        showToast('Não foi possível carregar os usuários. Tente novamente.', 'error')
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
    setEditingUser(null)
    setFormOpen(true)
  }

  const handleOpenEdit = (user) => {
    setEditingUser(user)
    setFormOpen(true)
  }

  const handleOpenDelete = (user) => {
    if (user.id === currentUser?.id) return
    setDeletingUser(user)
    setDeleteOpen(true)
  }

  const handleSave = async (payload) => {
    try {
      if (editingUser) {
        const updated = await updateUser(editingUser.id, payload)
        setUsers((prev) =>
          prev.map((item) => (item.id === editingUser.id ? { ...item, ...updated } : item)),
        )
        showToast('Usuário atualizado com sucesso.', 'success')
      } else {
        const created = await createUser(payload)
        setUsers((prev) => [created, ...prev])
        showToast('Usuário criado com sucesso.', 'success')
      }
    } catch (error) {
      showToast(
        getApiErrorMessage(
          error,
          editingUser
            ? 'Não foi possível atualizar o usuário.'
            : 'Não foi possível criar o usuário.',
        ),
        'error',
      )
      throw new Error('save failed')
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingUser) return

    setDeleteLoading(true)

    try {
      await deleteUser(deletingUser.id)
      setUsers((prev) => prev.filter((item) => item.id !== deletingUser.id))
      showToast('Usuário excluído com sucesso.', 'success')
      setDeleteOpen(false)
      setDeletingUser(null)
    } catch (error) {
      const status = error?.response?.status
      const message =
        status === 403
          ? 'Você não pode excluir seu próprio usuário.'
          : getApiErrorMessage(error, 'Não foi possível excluir o usuário.')

      showToast(message, 'error')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleLoadMore = () => {
    if (!hasMore || loadingMore) return
    loadUsers(page + 1, { append: true })
  }

  const handleRetry = () => {
    setIsLoading(true)
    setIsError(false)
    loadUsers(1)
  }

  const isEmpty = !isLoading && !isError && users.length === 0

  return (
    <section className="pb-24 md:pb-0">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text">Usuários</h1>
          <p className="mt-1 text-sm text-text-muted">Gerencie os membros da equipe</p>
        </div>

        <Button className="hidden md:inline-flex" onClick={handleOpenCreate}>
          + Novo Usuário
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
          <UserListSkeleton />
        </div>
      )}

      {isEmpty && (
        <div className="mt-6 rounded-xl border border-border bg-surface p-8 text-center">
          <p className="text-text-muted">Nenhum usuário cadastrado ainda.</p>
          <Button className="mt-4" onClick={handleOpenCreate}>
            Adicionar o primeiro usuário
          </Button>
        </div>
      )}

      {!isLoading && !isError && users.length > 0 && (
        <div className="mt-6 space-y-4">
          <div className="space-y-3 md:hidden">
            {users.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                currentUserId={currentUser?.id}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
              />
            ))}
          </div>

          <div className="hidden md:block">
            <UserTable
              users={users}
              currentUserId={currentUser?.id}
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
        aria-label="Novo usuário"
      >
        +
      </button>

      <UserFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        user={editingUser}
        onSave={handleSave}
      />

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => {
          if (!deleteLoading) {
            setDeleteOpen(false)
            setDeletingUser(null)
          }
        }}
        onConfirm={handleConfirmDelete}
        title="Excluir usuário"
        message={
          deletingUser
            ? `Tem certeza que deseja excluir "${deletingUser.name}"? Esta ação não pode ser desfeita.`
            : ''
        }
        confirmLabel="Excluir"
        loading={deleteLoading}
      />
    </section>
  )
}
