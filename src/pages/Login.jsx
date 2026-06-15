import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from '../components/Button'
import Input from '../components/Input'
import { useToast } from '../components/ToastContext'

export default function Login() {
  const { signIn } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)

    try {
      await signIn(email, password)
      navigate('/produtos', { replace: true })
    } catch {
      showToast('Credenciais inválidas. Verifique e tente novamente.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-surface-muted px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-sm md:p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-text">Sistema Administrativo</h1>
          <p className="mt-2 text-sm text-text-muted">
            Acesso exclusivo para funcionários
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            id="email"
            label="E-mail"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="seu@email.com"
          />

          <Input
            id="password"
            label="Senha"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
          />

          <Button type="submit" loading={loading} className="mt-2 w-full">
            Entrar
          </Button>
        </form>
      </div>
    </div>
  )
}
