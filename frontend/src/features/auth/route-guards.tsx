import { Navigate, Outlet } from 'react-router'
import logo from '@/assets/logo.png'
import { useAuth } from './use-auth'

/** Full-screen logo shown while the saved session is being checked. */
function Splash() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-700">
      <img src={logo} alt="Toilet Finder" className="w-64 rounded-3xl" />
    </div>
  )
}

/** Only logged-in admins; everyone else goes to the login. */
export function RequireAdmin() {
  const { state } = useAuth()
  if (state.status === 'loading') return <Splash />
  return state.status === 'signedIn' ? <Outlet /> : <Navigate to="/login" replace />
}

/** Login, forgot and reset pages: logged-in admins are sent to the panel. */
export function PublicOnly() {
  const { state } = useAuth()
  if (state.status === 'loading') return <Splash />
  return state.status === 'signedIn' ? <Navigate to="/" replace /> : <Outlet />
}
