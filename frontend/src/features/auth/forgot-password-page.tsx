import { useState, type SubmitEvent } from "react";
import { Link, useNavigate } from "react-router";
import { AuthLayout } from "@/components/auth-layout";
import { Button, ErrorNote, TextField } from "@/components/ui";
import { errorMessage } from "@/utils/errors";
import { useForgotPassword } from "./hooks";

/** Asks for the email and sends the reset code, then moves on to the reset page. */
export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const forgot = useForgotPassword();
  const [email, setEmail] = useState("");

  /** Sends the code and goes to the reset page, passing the email in the navigation state (not in the URL). */
  const submit = (event: SubmitEvent) => {
    event.preventDefault();
    const address = email.trim();
    forgot.mutate(address, {
      onSuccess: () =>
        navigate("/reset-password", { state: { email: address } }),
    });
  };

  return (
    <AuthLayout
      title="¿Olvidaste tu contraseña?"
      subtitle="Te enviaremos un código de 6 dígitos a tu correo"
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

        {forgot.isError ? (
          <ErrorNote>{errorMessage(forgot.error)}</ErrorNote>
        ) : null}

        <Button type="submit" loading={forgot.isPending}>
          Enviar código
        </Button>
      </form>

      <Link
        to="/login"
        className="text-center text-sm font-semibold text-brand-600 hover:underline"
      >
        Volver a iniciar sesión
      </Link>
    </AuthLayout>
  );
}
