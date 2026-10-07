import { useId, useState } from 'react'
import Button from '../../components/ui/Button'
import { Modal } from '../../components/student/StudentUi'
import styles from '../../components/student/Student.module.css'
import { type CatalogFood, type Meal, type Nutrients } from './studentData'

const nutrientFields = [
  { key: 'kcal', label: 'Calorias (kcal)' }, { key: 'protein', label: 'Proteínas (g)' },
  { key: 'carbs', label: 'Carboidratos (g)' }, { key: 'fat', label: 'Gorduras (g)' },
] as const

function NutrientFields({ value, change }: { value: Nutrients; change: (value: Nutrients) => void }) {
  return <div className={styles.formGrid}>{nutrientFields.map(({ key, label }) => <label key={key} className={styles.nutrient} data-nutrient={key}>{label}
    <input required type="number" min={0} max={100000} step="any" value={value[key] ?? ''} onChange={(event) => change({ ...value, [key]: event.target.value === '' ? null : Number(event.target.value) })} />
  </label>)}</div>
}

export function NameEditor({ title, label, initialName, close, save }: {
  title: string; label: string; initialName: string; close: () => void; save: (name: string) => void
}) {
  const [name, setName] = useState(initialName)
  const formId = useId()
  const attemptClose = () => { if (name === initialName || window.confirm('Descartar alterações não salvas?')) close() }
  return <Modal title={title} close={attemptClose} footer={<><Button variant="secondary" onClick={attemptClose}>Cancelar</Button><Button type="submit" form={formId} disabled={!name.trim()}>Salvar plano</Button></>}>
    <form id={formId} className={styles.form} onSubmit={(event) => { event.preventDefault(); if (name.trim()) save(name.trim()) }}>
      <label>{label}<input required maxLength={100} value={name} onChange={(event) => setName(event.target.value)} /></label>
    </form>
  </Modal>
}

export function MealEditor({ meal, foods, close, save }: { meal: Meal; foods: CatalogFood[]; close: () => void; save: (meal: Meal) => void }) {
  const [draft, setDraft] = useState(() => structuredClone(meal))
  const [dirty, setDirty] = useState(false)
  const [catalogId, setCatalogId] = useState('')
  const [error, setError] = useState('')
  const formId = useId()
  const attemptClose = () => { if (!dirty || window.confirm('Descartar alterações não salvas?')) close() }
  return <Modal wide title={meal.name ? 'Editar refeição' : 'Adicionar refeição'} close={attemptClose}
    footer={<><Button variant="secondary" onClick={attemptClose}>Cancelar</Button><Button type="submit" form={formId}>Salvar refeição</Button></>}>
    <form id={formId} className={styles.form} onChange={() => setDirty(true)} onSubmit={(event) => {
      event.preventDefault()
      if (!draft.name.trim() || draft.foods.some((food) => !food.name.trim())) { setError('Preencha o nome da refeição e dos alimentos.'); return }
      save({ ...draft, name: draft.name.trim(), foods: draft.foods.map((food) => ({ ...food, name: food.name.trim() })) })
    }}>
      <div className={styles.formGrid}>
        <label>Nome da refeição<input required maxLength={100} value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label>
        <label>Horário sugerido<input type="time" value={draft.time} onChange={(event) => setDraft({ ...draft, time: event.target.value })} /></label>
      </div>
      <label>Orientação (opcional)<textarea maxLength={600} value={draft.guidance} onChange={(event) => setDraft({ ...draft, guidance: event.target.value })} /></label>
      <div className={styles.row}><h3>Alimentos</h3><Button variant="secondary" onClick={() => {
        setDirty(true)
        setDraft({ ...draft, foods: [...draft.foods, { id: crypto.randomUUID(), name: '', quantity: 100, unit: 'g' }] })
      }}>Adicionar alimento</Button></div>
      {foods.length ? <div className={styles.formGrid}>
        <label>Alimento cadastrado<select value={catalogId} onChange={(event) => setCatalogId(event.target.value)}><option value="">Selecionar alimento</option>{foods.map((food) => <option value={food.id} key={food.id}>{food.name}</option>)}</select></label>
        <Button variant="secondary" disabled={!catalogId} onClick={() => {
          const food = foods.find((item) => item.id === catalogId)
          if (!food) return
          setDirty(true)
          setDraft({ ...draft, foods: [...draft.foods, { id: crypto.randomUUID(), name: food.name, quantity: food.amount, unit: food.unit }] })
          setCatalogId('')
        }}>Incluir na refeição</Button>
      </div> : null}
      {draft.foods.map((food, index) => <fieldset key={food.id} className={styles.editorItem}>
        <legend>Alimento {index + 1}</legend>
        <label>Nome do alimento {index + 1}<input required maxLength={100} value={food.name} onChange={(event) => setDraft({ ...draft, foods: draft.foods.map((item) => item.id === food.id ? { ...item, name: event.target.value } : item) })} /></label>
        <div className={styles.formGrid}>
          <label>Quantidade<input required type="number" min={0.1} max={100000} step="0.1" value={food.quantity} onChange={(event) => setDraft({ ...draft, foods: draft.foods.map((item) => item.id === food.id ? { ...item, quantity: Number(event.target.value) } : item) })} /></label>
          <label>Unidade<select value={food.unit} onChange={(event) => setDraft({ ...draft, foods: draft.foods.map((item) => item.id === food.id ? { ...item, unit: event.target.value } : item) })}>{['g', 'ml', 'unidade', 'fatia', 'porção'].map((unit) => <option key={unit}>{unit}</option>)}</select></label>
        </div>
        <div><Button variant="destructive" aria-label={`Remover alimento ${index + 1}`} onClick={() => {
          setDirty(true)
          setDraft({ ...draft, foods: draft.foods.filter((item) => item.id !== food.id) })
        }}>Remover alimento</Button></div>
      </fieldset>)}
      <h3>Totais planejados da refeição</h3>
      <NutrientFields value={draft.nutrients} change={(nutrients) => setDraft({ ...draft, nutrients })} />
      {error ? <p role="alert" className={styles.error}>{error}</p> : null}
    </form>
  </Modal>
}
