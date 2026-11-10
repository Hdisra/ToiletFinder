import { useState } from "react";
import { Text } from "react-native";
import { PrimaryButton } from "@/components/ui";
import { AuthScreen } from "@/features/auth/components/auth-screen";
import { LabeledInput } from "@/features/auth/components/labeled-input";
import { PasswordStrength } from "@/features/auth/components/password-strength";
import { useRegister } from "@/features/auth/hooks";
import { errorMessage } from "@/utils/errors";
import {
  isValidEmail,
  MAX_EMAIL_LENGTH,
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
} from "@/utils/validation";

/** Sign-up form: email and password. */
export default function RegisterScreen() {
  const register = useRegister();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // The button is enabled with a valid email and a long enough password.
  const canSubmit =
    isValidEmail(email) && password.length >= MIN_PASSWORD_LENGTH;
  /** Creates the account (ignored while a request is already running). */
  const submit = () => {
    if (canSubmit && !register.isPending)
      register.mutate({ email: email.trim(), password });
  };

  return (
    <AuthScreen
      title="Crea tu cuenta"
      subtitle="Solo necesitas un correo y una contraseña"
      showBack
      switchPrompt="¿Ya tienes cuenta?"
      switchLabel="Iniciar sesión"
      switchHref="/login"
    >
      <LabeledInput
        label="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
        maxLength={MAX_EMAIL_LENGTH}
      />
      <LabeledInput
        label={`Contraseña (mínimo ${MIN_PASSWORD_LENGTH} caracteres)`}
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

      {register.isError ? (
        <Text className="text-center font-medium text-danger">
          {errorMessage(register.error)}
        </Text>
      ) : null}

      <PrimaryButton
        label="Crear cuenta"
        onPress={submit}
        disabled={!canSubmit}
        loading={register.isPending}
      />
    </AuthScreen>
  );
}
