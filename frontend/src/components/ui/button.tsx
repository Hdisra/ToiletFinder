import type { ButtonHTMLAttributes } from "react";
import { Spinner } from "./spinner";

type ButtonVariant = "primary" | "secondary" | "danger";

/** Tailwind classes of each button look. */
const buttonStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-brand-600 to-brand-400 text-white hover:opacity-90",
  secondary: "bg-brand-100 text-brand-700 hover:bg-brand-200",
  danger: "bg-danger text-white hover:opacity-90",
};

/** Button with three looks. While `loading` it shows a spinner and cannot be clicked. */
export function Button({
  variant = "primary",
  loading,
  className = "",
  children,
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  loading?: boolean;
}) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${buttonStyles[variant]} ${className}`}
    >
      {loading ? <Spinner className="h-4 w-4" /> : null}
      {children}
    </button>
  );
}
