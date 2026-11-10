import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text } from "react-native";
import { MessageDialog } from "@/components/message-dialog";
import { PrimaryButton } from "@/components/ui";
import { AuthScreen } from "@/features/auth/components/auth-screen";
import { LabeledInput } from "@/features/auth/components/labeled-input";
import { PasswordStrength } from "@/features/auth/components/password-strength";
import { useForgotPassword, useResetPassword } from "@/features/auth/hooks";
import { errorMessage } from "@/utils/errors";
import {
  isValidEmail,
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
} from "@/utils/validation";

/** How long the "password updated" dialog stays before going to the login. */
const DIALOG_DURATION_MS = 2000;

/** Form to enter the emailed code and a new password. The email comes from the route (set by the forgot-password screen). */
export default function ResetPasswordScreen() {
  // A link can put anything in the URL (even a list): accept only one valid email.
  const params = useLocalSearchParams<{ email?: string | string[] }>();
  const candidate = Array.isArray(params.email)
    ? params.email[0]
    : params.email;
  const email = candidate && isValidEmail(candidate) ? candidate.trim() : "";
  const router = useRouter();
  const reset = useResetPassword();
  const resend = useForgotPassword();
  // What the user typed, and whether the password was already changed (shows the dialog).
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);

  // Show "password updated" for a moment, then go to the login.
  useEffect(() => {
    if (!done) return;
    const timer = setTimeout(
      () => router.replace("/login"),
      DIALOG_DURATION_MS,
    );
    return () => clearTimeout(timer);
  }, [done, router]);

  // The button is enabled with a known email, a full code and a long enough password.
  const canSubmit =
    email !== "" && code.length === 6 && password.length >= MIN_PASSWORD_LENGTH;
  /** Changes the password (ignored while a request is running or already done). */
  const submit = () => {
    if (!canSubmit || reset.isPending || done) return;
    reset.mutate(
      { email, code, newPassword: password },
      { onSuccess: () => setDone(true) },
    );
  };

  return (
    <AuthScreen
      title="Revisa tu correo"
      subtitle={
        email
          ? `Enviamos un código de 6 dígitos a ${email}`
          : "Primero solicita un código desde «¿Olvidaste tu contraseña?»"
      }
      showBack
    >
      <LabeledInput
        label="Código de 6 dígitos"
        value={code}
        onChangeText={(text) => setCode(text.replace(/\D/g, "").slice(0, 6))}
        keyboardType="number-pad"
        autoComplete="off"
        textContentType="none"
        maxLength={6}
      />
      <LabeledInput
        label={`Nueva contraseña (mínimo ${MIN_PASSWORD_LENGTH} caracteres)`}
        secure
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="go"
        maxLength={MAX_PASSWORD_LENGTH}
        onSubmitEditing={submit}
      />
      <PasswordStrength password={password} />

      {reset.isError ? (
        <Text className="text-center font-medium text-danger">
          {errorMessage(reset.error)}
        </Text>
      ) : null}

      <PrimaryButton
        label="Cambiar contraseña"
        onPress={submit}
        disabled={!canSubmit}
        loading={reset.isPending}
      />

      <Pressable
        onPress={() => resend.mutate(email)}
        disabled={resend.isPending || email === ""}
        className="items-center py-2"
      >
        <Text className="font-semibold text-brand-600">
          {resend.isSuccess
            ? "Te enviamos un código nuevo"
            : "¿No llegó? Reenviar código"}
        </Text>
      </Pressable>

      <MessageDialog visible={done} title="¡Contraseña actualizada!" />
    </AuthScreen>
  );
}
