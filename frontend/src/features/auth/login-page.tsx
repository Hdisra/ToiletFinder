import { useState, type SubmitEvent } from 'react'
import { Link } from 'react-router'
import { AuthLayout } from '@/components/auth-layout'
import { Button, ErrorNote, TextField } from '@/components/ui'
import { errorMessage } from '@/utils/errors'
import { useLogin } from './hooks'

/** Admin login form. */
export function LoginPage() {
  const login = useLogin()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  /** Sends the credentials (the email is trimmed). */
  const submit = (event: SubmitEvent) => {
    event.preventDefault()
    login.mutate({ email: email.trim(), password })
  }

  return (
    <AuthLayout
      title="Iniciar sesión como administrador"
      subtitle="Ingresa tus datos para continuar"
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        <TextField
          label="Correo electrónico"
          type="email"
          autoComplete="username"
          maxLength={254}
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Contraseña"
          type="password"
          autoComplete="current-password"
          maxLength={128}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {login.isError ? <ErrorNote>{errorMessage(login.error)}</ErrorNote> : null}

        <Button type="submit" loading={login.isPending}>
          Ingresar
        </Button>
      </form>

      <Link
        to="/forgot-password"
        className="text-center text-sm font-semibold text-brand-600 hover:underline"
      >
        ¿Olvidaste tu contraseña?
      </Link>
    </AuthLayout>
  )
}
