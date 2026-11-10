import { useMutation } from '@tanstack/react-query'
import { ApiError } from '@/api/client'
import { forgotPassword, login, resetPassword } from './api'
import { useAuth } from './use-auth'

/** Login mutation. Only admin accounts are accepted; on success the session is saved. */
export function useLogin() {
  const { signIn } = useAuth()
  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const session = await login(credentials)
      // Regular users share the same accounts; only admins may enter here.
      if (session.user.role !== 'admin') {
        throw new ApiError(403, 'Not an admin', 'NOT_ADMIN')
      }
      return session
    },
    onSuccess: signIn,
  })
}

/** Mutation that emails a reset code to the given address. */
export const useForgotPassword = () =>
  useMutation({ mutationFn: forgotPassword })

/** Mutation that changes the password with the emailed code. */
export const useResetPassword = () => useMutation({ mutationFn: resetPassword })
