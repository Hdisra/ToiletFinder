import { useNavigate } from 'react-router'
import { PageHeader } from '@/components/ui'
import { BathroomForm } from './bathroom-form'
import { useCreateBathroom } from './hooks'

/** Page to add a bathroom; the map starts at the admin's location. */
export function NewBathroomPage() {
  const navigate = useNavigate()
  const create = useCreateBathroom()

  return (
    <>
      <PageHeader icon="plus" title="Agregar baño" />
      <BathroomForm
        locateMe
        submitLabel="Agregar baño"
        pending={create.isPending}
        error={create.error}
        onSubmit={(bathroom) =>
          create.mutate(bathroom, {
            onSuccess: (created) =>
              navigate('/bathrooms', {
                state: { notice: `Baño «${created.name}» agregado.` },
              }),
          })
        }
      />
    </>
  )
}
