import { Link, useNavigate, useParams } from 'react-router'
import { ErrorNote, PageHeader, Spinner } from '@/components/ui'
import { errorMessage } from '@/utils/errors'
import { BathroomForm } from './bathroom-form'
import { useBathroom, useUpdateBathroom } from './hooks'

/** Page to edit the bathroom whose id is in the URL (`/bathrooms/:id/edit`). */
export function EditBathroomPage() {
  const id = Number(useParams().id)
  const navigate = useNavigate()
  const bathroom = useBathroom(id)
  const update = useUpdateBathroom(id)

  return (
    <>
      <PageHeader icon="edit" title="Editar baño" />

      {bathroom.isPending ? (
        <div className="flex justify-center py-24 text-brand-500">
          <Spinner className="h-8 w-8" />
        </div>
      ) : bathroom.isError ? (
        <div className="flex flex-col items-start gap-4">
          <ErrorNote>{errorMessage(bathroom.error)}</ErrorNote>
          <Link to="/bathrooms" className="text-sm font-semibold text-brand-600 hover:underline">
            Volver a los baños
          </Link>
        </div>
      ) : (
        <BathroomForm
          key={bathroom.data.id}
          initial={bathroom.data}
          submitLabel="Guardar cambios"
          pending={update.isPending}
          error={update.error}
          onSubmit={(changes) =>
            update.mutate(changes, {
              onSuccess: (saved) =>
                navigate('/bathrooms', {
                  state: { notice: `Baño «${saved.name}» actualizado.` },
                }),
            })
          }
        />
      )}
    </>
  )
}
