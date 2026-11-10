import { Button, ErrorNote, Modal } from '@/components/ui'
import { errorMessage } from '@/utils/errors'
import { useDeleteBathroom } from './hooks'
import type { Bathroom } from './types'

/** Confirmation window to delete a bathroom. Open while `bathroom` is not null; `onDeleted` runs after it was deleted. */
export function DeleteBathroomDialog({
  bathroom,
  onClose,
  onDeleted,
}: {
  bathroom: Bathroom | null
  onClose: () => void
  onDeleted: (bathroom: Bathroom) => void
}) {
  const remove = useDeleteBathroom()

  return (
    <Modal open={bathroom !== null} onClose={onClose} title="Eliminar baño">
      {bathroom ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-ink">
            ¿Seguro que quieres eliminar «<strong>{bathroom.name}</strong>»?{' '}
            {bathroom.ratingCount > 0
              ? `Se eliminarán también sus ${bathroom.ratingCount} ${
                  bathroom.ratingCount === 1 ? 'calificación' : 'calificaciones'
                }. `
              : ''}
            Esta acción no se puede deshacer.
          </p>

          {remove.isError ? <ErrorNote>{errorMessage(remove.error)}</ErrorNote> : null}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="danger"
              loading={remove.isPending}
              onClick={() =>
                remove.mutate(bathroom.id, {
                  onSuccess: () => {
                    onDeleted(bathroom)
                    onClose()
                  },
                })
              }
            >
              Eliminar
            </Button>
          </div>
        </div>
      ) : null}
    </Modal>
  )
}
