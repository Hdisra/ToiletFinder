import { useEffect, useRef, type ReactNode } from "react";
import { Icon } from "../icons";

/** Native <dialog>: closes with Escape and traps focus without extra libraries. */
export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  // Keeps the native dialog in sync with the `open` prop.
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-2xl p-0 shadow-xl backdrop:bg-ink/40"
    >
      {open ? (
        <div className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-muted hover:text-ink"
              aria-label="Cerrar"
            >
              <Icon name="x" />
            </button>
          </div>
          {children}
        </div>
      ) : null}
    </dialog>
  );
}
