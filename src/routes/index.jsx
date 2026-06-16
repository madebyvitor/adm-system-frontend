import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AdminRoute from '../components/AdminRoute'
import DashboardLayout from '../components/DashboardLayout'
import ProtectedRoute from '../components/ProtectedRoute'
import Login from '../pages/Login'
import Products from '../pages/Products'
import Promotions from '../pages/Promotions'
import Users from '../pages/Users'

function RootRedirect() {
  const { isAuthenticated } = useAuth()

  return <Navigate to={isAuthenticated ? '/produtos' : '/login'} replace />
}

function LoginRoute() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/produtos" replace />
  }

  return <Login />
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginRoute />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/produtos" element={<Products />} />
          <Route path="/promocoes" element={<Promotions />} />
          <Route element={<AdminRoute />}>
            <Route path="/usuarios" element={<Users />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
