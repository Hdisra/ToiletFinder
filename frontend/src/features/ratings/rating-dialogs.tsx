import { useState, type SubmitEvent } from 'react'
import { Button, ErrorNote, Modal } from '@/components/ui'
import { errorMessage } from '@/utils/errors'
import { useDeleteRating, useUpdateRating } from './hooks'
import type { AdminRating } from './types'

/** The scores an admin can pick: 1 to 10. */
const SCORES = Array.from({ length: 10 }, (_, i) => i + 1)

/** Form inside the edit window: pick a score and change the comment. */
function EditForm({
  rating,
  onClose,
}: {
  rating: AdminRating
  onClose: () => void
}) {
  const update = useUpdateRating()
  const [score, setScore] = useState(rating.score)
  const [comment, setComment] = useState(rating.comment ?? '')

  /** Save is enabled only if something changed. */
  const changed = score !== rating.score || comment.trim() !== (rating.comment ?? '')

  /** Saves the rating (an empty comment removes it) and closes the window. */
  const submit = (event: SubmitEvent) => {
    event.preventDefault()
    update.mutate(
      { id: rating.id, score, comment: comment.trim() || null },
      { onSuccess: onClose },
    )
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <p className="text-sm text-muted">
        {rating.bathroom.name} · {rating.userEmail ?? 'Anónimo'}
      </p>

      <div>
        <p className="mb-2 text-sm font-semibold text-muted">Calificación</p>
        <div className="grid grid-cols-5 gap-2">
          {SCORES.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setScore(value)}
              className={`h-11 rounded-xl text-base font-semibold transition ${
                score === value
                  ? 'bg-brand-500 text-white'
                  : 'bg-brand-50 text-ink hover:bg-brand-100'
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <label className="block rounded-xl border border-brand-200 bg-white px-4 pb-2 pt-2 focus-within:border-brand-500">
        <span className="block text-xs text-muted">Comentario (déjalo vacío para quitarlo)</span>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={500}
          rows={4}
          className="w-full resize-none bg-transparent py-1 text-base outline-none"
        />
      </label>

      {update.isError ? <ErrorNote>{errorMessage(update.error)}</ErrorNote> : null}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" loading={update.isPending} disabled={!changed}>
          Guardar cambios
        </Button>
      </div>
    </form>
  )
}

/** Window to edit a rating. Open while `rating` is not null. */
export function EditRatingDialog({
  rating,
  onClose,
}: {
  rating: AdminRating | null
  onClose: () => void
}) {
  return (
    <Modal open={rating !== null} onClose={onClose} title="Editar calificación">
      {rating ? <EditForm key={rating.id} rating={rating} onClose={onClose} /> : null}
    </Modal>
  )
}

/** Confirmation window to delete a rating. Open while `rating` is not null. */
export function DeleteRatingDialog({
  rating,
  onClose,
}: {
  rating: AdminRating | null
  onClose: () => void
}) {
  const remove = useDeleteRating()

  return (
    <Modal open={rating !== null} onClose={onClose} title="Eliminar calificación">
      {rating ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-ink">
            ¿Seguro que quieres eliminar la calificación {rating.score}/10 de{' '}
            <strong>{rating.userEmail ?? 'un usuario anónimo'}</strong> en «
            {rating.bathroom.name}»? Esta acción no se puede deshacer y el promedio del baño
            se recalculará.
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
              onClick={() => remove.mutate(rating.id, { onSuccess: onClose })}
            >
              Eliminar
            </Button>
          </div>
        </div>
      ) : null}
    </Modal>
  )
}
