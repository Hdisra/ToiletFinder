import { useMutation } from "@tanstack/react-query";
import { forgotPassword, login, register, resetPassword } from "./api";
import { useAuth } from "./auth-context";

/** Login mutation; on success the session is saved. */
export function useLogin() {
  const { signIn } = useAuth();
  return useMutation({ mutationFn: login, onSuccess: signIn });
}

/** Sign-up mutation; on success the session is saved. */
export function useRegister() {
  const { signIn } = useAuth();
  return useMutation({ mutationFn: register, onSuccess: signIn });
}

/** Mutation that emails a reset code to the given address. */
export const useForgotPassword = () =>
  useMutation({ mutationFn: forgotPassword });

/** Mutation that changes the password with the emailed code. */
export const useResetPassword = () =>
  useMutation({ mutationFn: resetPassword });
