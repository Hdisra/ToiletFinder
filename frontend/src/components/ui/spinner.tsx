/** Small rotating circle shown while something loads. Size and color come from `className`. */
export function Spinner({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      role="status"
      aria-label="Cargando"
    />
  );
}
