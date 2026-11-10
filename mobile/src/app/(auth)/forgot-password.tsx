import { useRouter } from "expo-router";
import { useState } from "react";
import { Text } from "react-native";
import { PrimaryButton } from "@/components/ui";
import { AuthScreen } from "@/features/auth/components/auth-screen";
import { LabeledInput } from "@/features/auth/components/labeled-input";
import { useForgotPassword } from "@/features/auth/hooks";
import { errorMessage } from "@/utils/errors";
import { isValidEmail, MAX_EMAIL_LENGTH } from "@/utils/validation";

/** Asks for the email and sends the reset code, then opens the reset screen. */
export default function ForgotPasswordScreen() {
  const router = useRouter();
  const forgot = useForgotPassword();
  const [email, setEmail] = useState("");

  // The button is enabled with a valid email.
  const canSubmit = isValidEmail(email);
  /** Sends the code and goes to the reset screen, passing the email. */
  const submit = () => {
    if (!canSubmit || forgot.isPending) return;
    const address = email.trim();
    forgot.mutate(address, {
      onSuccess: () =>
        router.push({
          pathname: "/reset-password",
          params: { email: address },
        }),
    });
  };

  return (
    <AuthScreen
      title="¿Olvidaste tu contraseña?"
      subtitle="Te enviaremos un código a tu correo"
      showBack
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
        returnKeyType="go"
        maxLength={MAX_EMAIL_LENGTH}
        onSubmitEditing={submit}
      />

      {forgot.isError ? (
        <Text className="text-center font-medium text-danger">
          {errorMessage(forgot.error)}
        </Text>
      ) : null}

      <PrimaryButton
        label="Enviar código"
        onPress={submit}
        disabled={!canSubmit}
        loading={forgot.isPending}
      />
    </AuthScreen>
  );
}
