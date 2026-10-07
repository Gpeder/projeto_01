import { useId, useState } from 'react'
import Button from '../../components/ui/Button'
import { Modal } from '../../components/student/StudentUi'
import styles from '../../components/student/Student.module.css'
import type { NutritionPlan } from './studentData'

type PlanDetails = Pick<NutritionPlan, 'name' | 'calorieLimit'>

export default function NutritionPlanEditor({ plan, close, save }: {
  plan: NutritionPlan | null; close: () => void; save: (details: PlanDetails) => void
}) {
  const initialName = plan?.name ?? ''
  const initialLimit = plan?.calorieLimit?.toString() ?? ''
  const [name, setName] = useState(initialName)
  const [limit, setLimit] = useState(initialLimit)
  const [error, setError] = useState('')
  const formId = useId()
  const hintId = useId()
  const attemptClose = () => {
    if ((name === initialName && limit === initialLimit) || window.confirm('Descartar alterações não salvas?')) close()
  }

  return <Modal title={plan ? 'Editar plano alimentar' : 'Criar plano alimentar'} close={attemptClose}
    footer={<><Button variant="secondary" onClick={attemptClose}>Cancelar</Button><Button type="submit" form={formId} disabled={!name.trim()}>Salvar plano</Button></>}>
    <form id={formId} className={styles.form} onChange={() => setError('')} onSubmit={(event) => {
      event.preventDefault()
      const calorieLimit = limit.trim() === '' ? null : Number(limit)
      if (calorieLimit !== null && (!Number.isFinite(calorieLimit) || calorieLimit < 0)) {
        setError('Informe um limite de calorias válido, igual ou maior que zero, ou deixe vazio.')
        return
      }
      if (name.trim()) save({ name: name.trim(), calorieLimit })
    }}>
      <label>Nome do plano<input required maxLength={100} value={name} onChange={(event) => setName(event.target.value)} /></label>
      <label>Limite diário de calorias (kcal, opcional)
        <input type="number" min={0} step="any" placeholder="Não definido" aria-describedby={hintId} value={limit} onChange={(event) => setLimit(event.target.value)} />
      </label>
      <p id={hintId} className={styles.muted}>Compare o limite com as calorias planejadas nas refeições. Deixe vazio para manter o plano sem limite definido.</p>
      <p className={styles.muted}>O limite fica disponível somente nesta sessão da página.</p>
      {error ? <p role="alert" className={styles.error}>{error}</p> : null}
    </form>
  </Modal>
}
