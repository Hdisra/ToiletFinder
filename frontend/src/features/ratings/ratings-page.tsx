import { useState } from 'react'
import { Icon } from '@/components/icons'
import {
  Card,
  ErrorNote,
  PageHeader,
  Pagination,
  ScoreBadge,
  SearchBox,
  Spinner,
} from '@/components/ui'
import { useDebounced } from '@/utils/debounce'
import { errorMessage } from '@/utils/errors'
import { formatDate } from '@/utils/format'
import { useRatings } from './hooks'
import { DeleteRatingDialog, EditRatingDialog } from './rating-dialogs'
import type { AdminRating } from './types'

/** Rows per page in the table. */
const PAGE_SIZE = 10

/** Table of ratings with search, pagination, and the edit / delete actions. */
export function RatingsPage() {
  // search = text in the box, page = current page, editing / deleting = rating with its window open.
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<AdminRating | null>(null)
  const [deleting, setDeleting] = useState<AdminRating | null>(null)
  const ratings = useRatings({
    page,
    pageSize: PAGE_SIZE,
    search: useDebounced(search.trim()),
  })

  return (
    <>
      <PageHeader icon="star" title="Calificaciones" />

      <Card>
        <div className="mb-5">
          <SearchBox
            value={search}
            onChange={(value) => {
              setSearch(value)
              setPage(1)
            }}
            placeholder="Buscar por baño, usuario o comentario"
          />
        </div>

        {ratings.isPending ? (
          <div className="flex justify-center py-12 text-brand-500">
            <Spinner className="h-8 w-8" />
          </div>
        ) : ratings.isError ? (
          <ErrorNote>{errorMessage(ratings.error)}</ErrorNote>
        ) : ratings.data.items.length === 0 ? (
          <p className="py-8 text-center text-muted">No hay calificaciones que mostrar.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-brand-100 text-muted">
                  <tr>
                    <th className="py-3 pr-4 font-semibold">Baño</th>
                    <th className="py-3 pr-4 font-semibold">Usuario</th>
                    <th className="py-3 pr-4 font-semibold">Calificación</th>
                    <th className="py-3 pr-4 font-semibold">Comentario</th>
                    <th className="py-3 pr-4 font-semibold">Fecha</th>
                    <th className="py-3 text-right font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {ratings.data.items.map((r) => (
                    <tr key={r.id} className="border-b border-brand-50 last:border-0">
                      <td className="py-3 pr-4 font-medium">{r.bathroom.name}</td>
                      <td className="py-3 pr-4 text-muted">{r.userEmail ?? 'Anónimo'}</td>
                      <td className="py-3 pr-4">
                        <ScoreBadge score={r.score} />
                      </td>
                      <td className="max-w-xs py-3 pr-4 text-muted">
                        <p className="line-clamp-2">{r.comment ?? '—'}</p>
                      </td>
                      <td className="py-3 pr-4 text-muted">{formatDate(r.createdAt)}</td>
                      <td className="py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setEditing(r)}
                            className="rounded-lg p-2 text-brand-600 hover:bg-brand-50"
                            aria-label="Editar calificación"
                            title="Editar"
                          >
                            <Icon name="edit" className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleting(r)}
                            className="rounded-lg p-2 text-danger hover:bg-danger/10"
                            aria-label="Eliminar calificación"
                            title="Eliminar"
                          >
                            <Icon name="trash" className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={ratings.data.page}
              pageSize={PAGE_SIZE}
              total={ratings.data.total}
              onChange={setPage}
            />
          </>
        )}
      </Card>

      <EditRatingDialog rating={editing} onClose={() => setEditing(null)} />
      <DeleteRatingDialog rating={deleting} onClose={() => setDeleting(null)} />
    </>
  )
}
