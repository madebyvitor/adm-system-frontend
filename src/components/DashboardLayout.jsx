import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from './Button'

const navItems = [
  { to: '/produtos', label: 'Produtos' },
  { to: '/promocoes', label: 'Promoções' },
  { to: '/usuarios', label: 'Usuários', adminOnly: true },
]

function SidebarContent({ onNavigate }) {
  const { user, isAdmin, signOut } = useAuth()
  const visibleNavItems = navItems.filter((item) => !item.adminOnly || isAdmin)
  const navigate = useNavigate()

  const handleSignOut = () => {
    signOut()
    navigate('/login')
    onNavigate?.()
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-4 py-5">
        <p className="text-lg font-semibold text-text">Sistema Admin</p>
        <p className="text-sm text-text-muted">Painel administrativo</p>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {visibleNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `block rounded-lg px-3 py-3 text-sm font-medium transition ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-text hover:bg-surface-muted'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border px-4 py-4">
        <div className="mb-3">
          <p className="truncate text-sm font-medium text-text">{user?.name}</p>
          <p className="truncate text-xs text-text-muted">{user?.email}</p>
        </div>
        <Button variant="ghost" className="w-full" onClick={handleSignOut}>
          Sair
        </Button>
      </div>
    </div>
  )
}

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const closeSidebar = () => setIsSidebarOpen(false)

  return (
    <div className="min-h-dvh bg-surface-muted">
      <div className="flex min-h-dvh">
        <aside className="hidden w-64 shrink-0 border-r border-border bg-surface md:block">
          <SidebarContent />
        </aside>

        {isSidebarOpen && (
          <button
            type="button"
            aria-label="Fechar menu"
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={closeSidebar}
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-border bg-surface transition-transform md:hidden ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <SidebarContent onNavigate={closeSidebar} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center gap-3 border-b border-border bg-surface px-4 py-3 md:hidden">
            <button
              type="button"
              aria-label="Abrir menu"
              className="inline-flex size-10 items-center justify-center rounded-lg border border-border text-text"
              onClick={() => setIsSidebarOpen(true)}
            >
              <span className="flex flex-col gap-1">
                <span className="block h-0.5 w-5 bg-current" />
                <span className="block h-0.5 w-5 bg-current" />
                <span className="block h-0.5 w-5 bg-current" />
              </span>
            </button>
            <p className="text-base font-semibold text-text">Sistema Admin</p>
          </header>

          <main className="flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
