import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import { Icon } from '@/components/icons'
import {
  Card,
  ErrorNote,
  PageHeader,
  Pagination,
  SearchBox,
  Spinner,
  SuccessNote,
} from '@/components/ui'
import { useDebounced } from '@/utils/debounce'
import { errorMessage } from '@/utils/errors'
import { formatDate, formatPrice, formatScore } from '@/utils/format'
import { categoryLabel } from './categories'
import { DeleteBathroomDialog } from './delete-bathroom-dialog'
import { useBathrooms } from './hooks'
import type { Bathroom } from './types'

/** Rows per page in the table. */
const PAGE_SIZE = 10

/** Table of bathrooms with search, pagination, and the edit / delete actions. */
export function BathroomsPage() {
  // The add and edit pages leave a message here when they finish.
  const [notice, setNotice] = useState(
    (useLocation().state as { notice?: string } | null)?.notice ?? null,
  )
  // search = text in the box, page = current page, deleting = bathroom waiting for delete confirmation.
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [deleting, setDeleting] = useState<Bathroom | null>(null)
  const bathrooms = useBathrooms({
    page,
    pageSize: PAGE_SIZE,
    search: useDebounced(search.trim()),
  })

  return (
    <>
      <PageHeader
        icon="pin"
        title="Baños"
        actions={
          <Link
            to="/bathrooms/new"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-400 px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
          >
            <Icon name="plus" className="h-4 w-4" />
            Agregar baño
          </Link>
        }
      />

      {notice ? (
        <div className="mb-5">
          <SuccessNote>{notice}</SuccessNote>
        </div>
      ) : null}

      <Card>
        <div className="mb-5">
          <SearchBox
            value={search}
            onChange={(value) => {
              setSearch(value)
              setPage(1)
            }}
            placeholder="Buscar por nombre"
          />
        </div>

        {bathrooms.isPending ? (
          <div className="flex justify-center py-12 text-brand-500">
            <Spinner className="h-8 w-8" />
          </div>
        ) : bathrooms.isError ? (
          <ErrorNote>{errorMessage(bathrooms.error)}</ErrorNote>
        ) : bathrooms.data.items.length === 0 ? (
          <p className="py-8 text-center text-muted">No hay baños que mostrar.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-brand-100 text-muted">
                  <tr>
                    <th className="py-3 pr-4 font-semibold">Nombre</th>
                    <th className="py-3 pr-4 font-semibold">Categoría</th>
                    <th className="py-3 pr-4 font-semibold">Costo</th>
                    <th className="py-3 pr-4 font-semibold">Calificación</th>
                    <th className="py-3 pr-4 font-semibold">Agregado</th>
                    <th className="py-3 text-right font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {bathrooms.data.items.map((b) => (
                    <tr key={b.id} className="border-b border-brand-50 last:border-0">
                      <td className="py-3 pr-4">
                        <p className="font-medium">{b.name}</p>
                        {b.address ? (
                          <p className="text-xs text-muted">{b.address}</p>
                        ) : null}
                      </td>
                      <td className="py-3 pr-4 text-muted">{categoryLabel(b.category)}</td>
                      <td
                        className={`py-3 pr-4 font-medium ${b.isFree ? 'text-free' : 'text-paid'}`}
                      >
                        {formatPrice(b.isFree, b.price)}
                      </td>
                      <td className="py-3 pr-4">
                        {b.ratingCount > 0 ? (
                          <>
                            ★ {formatScore(b.averageRating)}{' '}
                            <span className="text-muted">({b.ratingCount})</span>
                          </>
                        ) : (
                          <span className="text-muted">Sin calificaciones</span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-muted">{formatDate(b.createdAt)}</td>
                      <td className="py-3">
                        <div className="flex justify-end gap-1">
                          <Link
                            to={`/bathrooms/${b.id}/edit`}
                            className="rounded-lg p-2 text-brand-600 hover:bg-brand-50"
                            aria-label={`Editar ${b.name}`}
                            title="Editar"
                          >
                            <Icon name="edit" className="h-4 w-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeleting(b)}
                            className="rounded-lg p-2 text-danger hover:bg-danger/10"
                            aria-label={`Eliminar ${b.name}`}
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
              page={bathrooms.data.page}
              pageSize={PAGE_SIZE}
              total={bathrooms.data.total}
              onChange={setPage}
            />
          </>
        )}
      </Card>

      <DeleteBathroomDialog
        bathroom={deleting}
        onClose={() => setDeleting(null)}
        onDeleted={(bathroom) => {
          setNotice(`Baño «${bathroom.name}» eliminado.`)
          // Deleting the only row of the last page: go back one page.
          if (page > 1 && bathrooms.data?.items.length === 1) setPage(page - 1)
        }}
      />
    </>
  )
}
