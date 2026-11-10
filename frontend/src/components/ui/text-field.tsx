import { useState, type InputHTMLAttributes } from "react";
import { Icon } from "../icons";

/** Input with its label inside the box. Password inputs get an eye to reveal the text. */
export function TextField({
  label,
  type = "text",
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";

  return (
    <label
      className={`block rounded-xl border border-brand-200 bg-white px-4 pb-1.5 pt-2 focus-within:border-brand-500 ${className}`}
    >
      <span className="block text-xs text-muted">{label}</span>
      <span className="flex items-center gap-2">
        <input
          {...props}
          type={isPassword && visible ? "text" : type}
          className="w-full bg-transparent py-1 text-base text-ink outline-none placeholder:text-muted/60"
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="text-muted hover:text-ink"
            aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            <Icon name={visible ? "eyeOff" : "eye"} />
          </button>
        ) : null}
      </span>
    </label>
  );
}
