import { Link } from "expo-router";
import { useState } from "react";
import { Pressable, Text } from "react-native";
import { PrimaryButton } from "@/components/ui";
import { AuthScreen } from "@/features/auth/components/auth-screen";
import { LabeledInput } from "@/features/auth/components/labeled-input";
import { useLogin } from "@/features/auth/hooks";
import { errorMessage } from "@/utils/errors";
import {
  isValidEmail,
  MAX_EMAIL_LENGTH,
  MAX_PASSWORD_LENGTH,
} from "@/utils/validation";

/** Login form. */
export default function LoginScreen() {
  const login = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // The button is enabled with a valid email and some password.
  const canSubmit = isValidEmail(email) && password.length > 0;
  /** Sends the credentials (ignored while a request is already running). */
  const submit = () => {
    if (canSubmit && !login.isPending)
      login.mutate({ email: email.trim(), password });
  };

  return (
    <AuthScreen
      title="Bienvenido de nuevo"
      subtitle="Ingresa tus datos"
      switchPrompt="¿No tienes cuenta?"
      switchLabel="Registrarte"
      switchHref="/register"
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
        label="Contraseña"
        secure
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="go"
        maxLength={MAX_PASSWORD_LENGTH}
        onSubmitEditing={submit}
      />

      {login.isError ? (
        <Text className="text-center font-medium text-danger">
          {errorMessage(login.error)}
        </Text>
      ) : null}

      <PrimaryButton
        label="Iniciar sesión"
        onPress={submit}
        disabled={!canSubmit}
        loading={login.isPending}
      />

      <Link href="/forgot-password" asChild>
        <Pressable className="items-center py-2">
          <Text className="font-semibold text-brand-600">
            ¿Olvidaste tu contraseña?
          </Text>
        </Pressable>
      </Link>
    </AuthScreen>
  );
}
