import { useId, useState } from 'react'
import Button from '../../components/ui/Button'
import { Modal } from '../../components/student/StudentUi'
import styles from '../../components/student/Student.module.css'
import { type CatalogFood, type Food, type Meal, type Nutrients } from './studentData'
import { foodNutrientFields, formatFoodValue } from './foodDraft'
import { calculateFoodNutrients, foodCalculationIssue, includeCatalogFood, isPositiveQuantity, linkCatalogFood, mealNutrients } from './nutritionCalculations'
import { MealFoodSource, MealNutrients } from './MealNutrients'

function NutrientFields({ value, change }: { value: Nutrients; change: (value: Nutrients) => void }) {
  return <div className={styles.formGrid}>{foodNutrientFields.map(({ key, label }) => <label key={key} className={styles.nutrient} data-nutrient={key}>{label}
    <input type="number" min={0} step="any" placeholder="Não informado" value={value[key] ?? ''} onChange={(event) => change({ ...value, [key]: event.target.value === '' ? null : Number(event.target.value) })} />
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

type DraftFood = Omit<Food, 'quantity'> & { quantity: string }
type MealDraft = Omit<Meal, 'foods'> & { foods: DraftFood[] }
const draftFood = (food: Food): DraftFood => ({ ...food, quantity: String(food.quantity) })
const quantityValue = (value: string) => value.trim() === '' ? NaN : Number(value)

export function MealEditor({ meal, foods, close, save }: { meal: Meal; foods: CatalogFood[]; close: () => void; save: (meal: Meal) => void }) {
  const [draft, setDraft] = useState<MealDraft>(() => ({ ...structuredClone(meal), foods: structuredClone(meal.foods).map(draftFood) }))
  const [dirty, setDirty] = useState(false)
  const [catalogId, setCatalogId] = useState('')
  const [error, setError] = useState('')
  const formId = useId()
  const unitHintId = useId()
  const currentMeal: Meal = { ...draft, foods: draft.foods.map((food) => ({ ...food, quantity: quantityValue(food.quantity) })) }
  const totals = mealNutrients(currentMeal)
  const unlinked = draft.foods.filter((food) => !food.snapshot)
  const attemptClose = () => { if (!dirty || window.confirm('Descartar alterações não salvas?')) close() }

  function edit(update: (previous: MealDraft) => MealDraft) {
    setDraft(update)
    setDirty(true)
    setError('')
  }

  function updateFood(id: string, patch: Partial<DraftFood>) {
    edit((previous) => ({ ...previous, foods: previous.foods.map((food) => food.id === id ? { ...food, ...patch } : food) }))
  }

  function switchMode(next: Meal['totalsMode']) {
    if (next === draft.totalsMode) return
    const message = next === 'calculated'
      ? 'Usar os alimentos para os totais desta refeição? Os valores manuais ficarão guardados para quando voltar ao modo manual. Alimentos sem referência deixarão os totais incompletos.'
      : 'Usar os valores manuais guardados como totais desta refeição? Revise-os antes de salvar. Os alimentos e suas quantidades serão mantidos; os totais calculados não serão copiados nem somados.'
    if (window.confirm(message)) edit((previous) => ({ ...previous, totalsMode: next }))
  }

  function linkFood(food: DraftFood, catalogId: string) {
    const catalog = foods.find((item) => item.id === catalogId)
    if (!catalog) return
    const quantityNotice = food.unit === catalog.unit
      ? 'A quantidade utilizada será mantida.'
      : `A quantidade utilizada passará de ${food.quantity || 'vazia'} ${food.unit} para ${formatFoodValue(catalog.amount, catalog.unit)}, sem conversão entre unidades.`
    if (!window.confirm(`Vincular ${food.name || 'este alimento'} a ${catalog.name}? O nome e a referência nutricional serão substituídos pelos dados atuais do cadastro. ${quantityNotice}`)) return
    try {
      const linked = linkCatalogFood({ ...food, quantity: quantityValue(food.quantity) }, catalog)
      updateFood(food.id, { ...draftFood(linked), quantity: food.unit === catalog.unit ? food.quantity : String(linked.quantity) })
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Confira o cadastro do alimento.')
    }
  }

  return <Modal wide title={meal.name ? 'Editar refeição' : 'Adicionar refeição'} close={attemptClose}
    footer={<><Button variant="secondary" onClick={attemptClose}>Cancelar</Button><Button type="submit" form={formId}>Salvar refeição</Button></>}>
    <form id={formId} className={styles.form} onSubmit={(event) => {
      event.preventDefault()
      if (!draft.name.trim() || draft.foods.some((food) => !food.name.trim())) { setError('Preencha o nome da refeição e dos alimentos.'); return }
      for (const food of currentMeal.foods) {
        if (!isPositiveQuantity(food.quantity)) { setError(`Informe uma quantidade finita e maior que zero para ${food.name}.`); return }
        const issue = food.snapshot ? foodCalculationIssue(food) : null
        if (issue) { setError(`${food.name}: ${issue}`); return }
      }
      if (Object.values(draft.nutrients).some((value) => value !== null && (!Number.isFinite(value) || value < 0))) {
        setError('Os totais manuais devem ser números finitos, iguais ou maiores que zero, ou ficar vazios.'); return
      }
      save({ ...currentMeal, name: draft.name.trim(), foods: currentMeal.foods.map((food) => ({ ...food, name: food.name.trim() })) })
    }}>
      <div className={styles.formGrid}>
        <label>Nome da refeição<input required maxLength={100} value={draft.name} onChange={(event) => edit((previous) => ({ ...previous, name: event.target.value }))} /></label>
        <label>Horário sugerido<input type="time" value={draft.time} onChange={(event) => edit((previous) => ({ ...previous, time: event.target.value }))} /></label>
      </div>
      <label>Orientação (opcional)<textarea maxLength={600} value={draft.guidance} onChange={(event) => edit((previous) => ({ ...previous, guidance: event.target.value }))} /></label>
      <label>Origem dos totais<select value={draft.totalsMode} onChange={(event) => switchMode(event.target.value as Meal['totalsMode'])}>
        <option value="calculated">Calculada pelos alimentos</option><option value="manual">Manual</option>
      </select></label>
      <p className={styles.muted}>{draft.totalsMode === 'calculated'
        ? 'Os totais acompanham as quantidades dos alimentos e são somente leitura.'
        : 'Os totais são informados por você. Os nutrientes dos alimentos não serão somados a esses valores.'}</p>
      <div className={styles.row}><h3>Alimentos</h3><Button variant="secondary" onClick={() => {
        const id = crypto.randomUUID()
        edit((previous) => ({ ...previous, foods: [...previous.foods, { id, name: '', quantity: '100', unit: 'g' }] }))
      }}>Adicionar sem cadastro</Button></div>
      {foods.length ? <div className={styles.formGrid}>
        <label>Alimento cadastrado<select value={catalogId} onChange={(event) => setCatalogId(event.target.value)}><option value="">Selecionar alimento</option>{foods.map((food) => <option value={food.id} key={food.id}>{food.name}</option>)}</select></label>
        <Button variant="secondary" disabled={!catalogId} onClick={() => {
          const food = foods.find((item) => item.id === catalogId)
          if (!food) return
          try {
            const entry = draftFood(includeCatalogFood(food, crypto.randomUUID()))
            edit((previous) => ({ ...previous, foods: [...previous.foods, entry] }))
            setCatalogId('')
          } catch (failure) {
            setError(failure instanceof Error ? failure.message : 'Confira o cadastro do alimento.')
          }
        }}>Incluir na refeição</Button>
      </div> : <p className={styles.muted}>Cadastre um alimento na tela de alimentação para calcular seus nutrientes aqui.</p>}
      <p id={unitHintId} className={styles.muted}>Alimentos vinculados usam a unidade da referência, sem conversão. Alterar a quantidade da refeição não altera essa referência nem o cadastro.</p>
      {draft.foods.length === 0 ? <p className={styles.mealNotice}>Nenhum alimento adicionado. {draft.totalsMode === 'calculated' ? 'Inclua alimentos para obter os totais.' : 'Os totais manuais podem ser informados abaixo.'}</p> : null}
      {draft.totalsMode === 'calculated' && unlinked.length > 0 ? <div className={styles.mealNotice}>
        <p>Precisam ser vinculados a um alimento cadastrado para completar os totais:</p>
        <ul>{unlinked.map((food) => <li key={food.id}>{food.name || 'Alimento sem nome'}</li>)}</ul>
      </div> : null}
      {draft.foods.map((food, index) => <fieldset key={food.id} className={styles.editorItem}>
        <legend>Alimento {index + 1}</legend>
        <label>Nome do alimento {index + 1}<input required maxLength={1000} value={food.name} onChange={(event) => updateFood(food.id, { name: event.target.value })} /></label>
        <div className={styles.formGrid}>
          <label>Quantidade na refeição<input required type="number" min={0} step="any" value={food.quantity} onChange={(event) => updateFood(food.id, { quantity: event.target.value })} /></label>
          <label>Unidade{food.snapshot
            ? <input readOnly value={food.unit} aria-describedby={unitHintId} />
            : <select value={food.unit} onChange={(event) => updateFood(food.id, { unit: event.target.value })}>{['g', 'ml', 'unidade', 'fatia', 'porção'].map((unit) => <option key={unit}>{unit}</option>)}</select>}
          </label>
        </div>
        <MealFoodSource food={currentMeal.foods[index]} />
        {food.snapshot ? <MealNutrients nutrients={calculateFoodNutrients(currentMeal.foods[index])} /> : <p className={styles.muted}>Sem referência nutricional. Vincule um cadastro para calcular esta quantidade.</p>}
        {food.snapshot && foodCalculationIssue(currentMeal.foods[index]) ? <p className={styles.error}>{foodCalculationIssue(currentMeal.foods[index])}</p> : null}
        {foods.length > 0 ? <label>{food.snapshot ? 'Atualizar vínculo com o cadastro' : 'Vincular a alimento cadastrado'}
          <select value="" onChange={(event) => linkFood(food, event.target.value)}>
            <option value="">Selecionar cadastro para este alimento</option>
            {foods.map((catalog) => <option value={catalog.id} key={catalog.id}>{catalog.name} · {formatFoodValue(catalog.amount, catalog.unit)}</option>)}
          </select>
        </label> : null}
        <div><Button variant="destructive" aria-label={`Remover alimento ${index + 1}`} onClick={() => edit((previous) => ({ ...previous, foods: previous.foods.filter((item) => item.id !== food.id) }))}>Remover alimento</Button></div>
      </fieldset>)}
      <h3>Totais planejados da refeição</h3>
      {draft.totalsMode === 'manual'
        ? <><NutrientFields value={draft.nutrients} change={(nutrients) => edit((previous) => ({ ...previous, nutrients }))} /><p className={styles.muted}>Deixe vazio o que não foi informado. Zero representa um valor conhecido.</p></>
        : <><MealNutrients nutrients={totals} /><p className={styles.muted}>Um nutriente incompleto indica dados ausentes ou inválidos em algum alimento. Os demais totais continuam disponíveis.</p></>}
      {error ? <p role="alert" className={styles.error}>{error}</p> : null}
    </form>
  </Modal>
}
