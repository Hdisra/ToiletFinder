import { Button } from "./button";

/** Result count plus "Anterior / Siguiente" buttons. `onChange` receives the new page (starting at 1). */
export function Pagination({
  page,
  pageSize,
  total,
  onChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="mt-5 flex items-center justify-between text-sm text-muted">
      <span>
        {total} {total === 1 ? "resultado" : "resultados"}
      </span>
      <div className="flex items-center gap-3">
        <Button
          variant="secondary"
          className="px-3 py-2"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          Anterior
        </Button>
        <span>
          Página {page} de {pages}
        </span>
        <Button
          variant="secondary"
          className="px-3 py-2"
          disabled={page >= pages}
          onClick={() => onChange(page + 1)}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}
