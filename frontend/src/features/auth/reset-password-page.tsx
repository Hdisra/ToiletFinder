import { useEffect, useState, type SubmitEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { AuthLayout } from '@/components/auth-layout'
import { Button, ErrorNote, SuccessNote, TextField } from '@/components/ui'
import { errorMessage } from '@/utils/errors'
import { useForgotPassword, useResetPassword } from './hooks'

/** How long the success message stays before going to the login. */
const REDIRECT_DELAY_MS = 2000
/** Same minimum the backend requires. */
const MIN_PASSWORD_LENGTH = 8

/** Form to enter the emailed code and a new password. The email comes from the navigation state set by the forgot-password page. */
export function ResetPasswordPage() {
  // Only a text is accepted; opening this page directly leaves the email empty and the form disabled.
  const state = useLocation().state as { email?: unknown } | null
  const email = typeof state?.email === 'string' ? state.email : ''
  const navigate = useNavigate()
  const reset = useResetPassword()
  const resend = useForgotPassword()
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')

  // After a successful change, show a message for a moment and go to the login.
  useEffect(() => {
    if (!reset.isSuccess) return
    const timer = setTimeout(() => navigate('/login'), REDIRECT_DELAY_MS)
    return () => clearTimeout(timer)
  }, [reset.isSuccess, navigate])

  /** The button is enabled only with a full code and a long enough password. */
  const canSubmit =
    code.length === 6 && password.length >= MIN_PASSWORD_LENGTH && email !== ''

  /** Changes the password. */
  const submit = (event: SubmitEvent) => {
    event.preventDefault()
    if (canSubmit) reset.mutate({ email, code, newPassword: password })
  }

  return (
    <AuthLayout
      title="Revisa tu correo"
      subtitle={
        email
          ? `Enviamos un código de 6 dígitos a ${email}`
          : 'Primero solicita un código desde «¿Olvidaste tu contraseña?»'
      }
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        <TextField
          label="Código de 6 dígitos"
          inputMode="numeric"
          autoComplete="off"
          maxLength={6}
          required
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
        />
        <TextField
          label={`Nueva contraseña (mínimo ${MIN_PASSWORD_LENGTH} caracteres)`}
          type="password"
          autoComplete="new-password"
          maxLength={128}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {reset.isError ? <ErrorNote>{errorMessage(reset.error)}</ErrorNote> : null}
        {reset.isSuccess ? (
          <SuccessNote>¡Contraseña actualizada! Te llevamos al inicio de sesión…</SuccessNote>
        ) : null}

        <Button
          type="submit"
          loading={reset.isPending}
          disabled={!canSubmit || reset.isSuccess}
        >
          Cambiar contraseña
        </Button>
      </form>

      <button
        type="button"
        onClick={() => resend.mutate(email)}
        disabled={resend.isPending || email === ''}
        className="text-center text-sm font-semibold text-brand-600 hover:underline"
      >
        {resend.isSuccess ? 'Te enviamos un código nuevo' : '¿No llegó? Reenviar código'}
      </button>
      <Link
        to="/login"
        className="text-center text-sm text-muted hover:underline"
      >
        Volver a iniciar sesión
      </Link>
    </AuthLayout>
  )
}
