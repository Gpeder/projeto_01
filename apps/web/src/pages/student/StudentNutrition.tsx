import { useState } from 'react'
import { addOutline } from 'ionicons/icons'
import Button from '../../components/ui/Button'
import { Icon } from '../../components/student/StudentUi'
import styles from '../../components/student/Student.module.css'
import { formatNumber, sumNutrients, type CatalogFood, type Meal } from './studentData'
import { useStudent } from './StudentPage'
import { FoodEditor, MealEditor, NameEditor } from './StudentEditors'

export default function StudentNutrition() {
  const { nutrition, setNutrition, foods, setFoods } = useStudent()
  const [meal, setMeal] = useState<Meal | null>(null)
  const [food, setFood] = useState<CatalogFood | null>(null)
  const [planEditor, setPlanEditor] = useState(false)
  const totals = nutrition ? sumNutrients(nutrition.meals) : null
  const addMeal = () => setMeal({ id: crypto.randomUUID(), name: '', time: '', guidance: '', foods: [], nutrients: { kcal: 0, protein: 0, carbs: 0, fat: 0 } })
  const addFood = () => setFood({ id: crypto.randomUUID(), name: '', brand: '', preparation: '', amount: 100, unit: 'g', nutrients: { kcal: 0, protein: 0, carbs: 0, fat: 0 } })

  return <>
    <title>Alimentação de Gustavo | consta</title>
    <div className={styles.toolbar}>
      <div><p className={styles.eyebrow}>Planejamento alimentar</p><h2>Alimentação de Gustavo</h2></div>
      <Button onClick={nutrition ? addMeal : () => setPlanEditor(true)}><span className={styles.actions}><Icon icon={addOutline} />{nutrition ? 'Adicionar refeição' : 'Criar plano'}</span></Button>
    </div>
    {nutrition && totals ? <>
      <section className={styles.plan} aria-label="Plano alimentar">
        <div><span className={styles.tag}>Plano atual</span><h3>{nutrition.name}</h3><p className={styles.muted}>{nutrition.meals.length} refeições planejadas</p></div>
        <div className={styles.actions}><Button variant="secondary" onClick={addFood}>Cadastrar alimento</Button><Button onClick={() => setPlanEditor(true)}>Editar plano</Button></div>
      </section>
      <dl className={`${styles.metrics} ${styles.totals}`}>
        <div><dt>Planejado no dia</dt><dd>{formatNumber(totals.kcal)} kcal</dd></div>
        <div><dt>Proteínas</dt><dd>{formatNumber(totals.protein)} g</dd></div>
        <div><dt>Carboidratos</dt><dd>{formatNumber(totals.carbs)} g</dd></div>
        <div><dt>Gorduras</dt><dd>{formatNumber(totals.fat)} g</dd></div>
      </dl>
      {nutrition.meals.length ? nutrition.meals.map((item) => <section className={styles.meal} key={item.id} aria-label={item.name}>
        <div className={styles.mealHeading}>
          <div>{item.time ? <time>{item.time}</time> : null}<h3>{item.name}</h3></div>
          <div><strong>{formatNumber(item.nutrients.kcal)} kcal planejadas</strong><div><button className={styles.action} onClick={() => setMeal(item)} aria-label={`Editar ${item.name}`}>Editar refeição</button></div></div>
        </div>
        <p className={styles.muted}>{formatNumber(item.nutrients.protein)} g P · {formatNumber(item.nutrients.carbs)} g C · {formatNumber(item.nutrients.fat)} g G</p>
        {item.guidance ? <p className={styles.muted}>{item.guidance}</p> : null}
        <ul>{item.foods.map((entry) => <li key={entry.id} className={styles.food}>
          <span>{entry.name} · {formatNumber(entry.quantity)} {entry.unit}</span>
          <button className={styles.action} onClick={() => setMeal(item)} aria-label={`Editar ${entry.name} em ${item.name}`}>Editar</button>
        </li>)}</ul>
        <button className={`${styles.action} text-error`} onClick={() => {
          if (window.confirm(`Remover ${item.name} do plano?`)) setNutrition({ ...nutrition, meals: nutrition.meals.filter((entry) => entry.id !== item.id) })
        }}>Remover refeição</button>
      </section>) : <div className={styles.empty}><h3>Nenhuma refeição adicionada</h3><Button onClick={addMeal}>Adicionar refeição</Button></div>}
      <div className={styles.destructive}><strong>Remover plano atual</strong><Button variant="destructive" onClick={() => {
        if (window.confirm('Remover o plano alimentar atual?')) setNutrition(null)
      }}>Remover plano</Button></div>
    </> : <section className={styles.empty}><h3>Sem plano alimentar</h3><Button onClick={() => setPlanEditor(true)}>Criar plano</Button></section>}
    {foods.length ? <section className={styles.section}>
      <div className={styles.row}><h2>Alimentos cadastrados</h2><Button variant="secondary" onClick={addFood}>Cadastrar alimento</Button></div>
      {foods.map((item) => <div className={styles.food} key={item.id}>
        <div><strong>{item.name}</strong><p>{formatNumber(item.amount)} {item.unit} · {formatNumber(item.nutrients.kcal)} kcal</p></div>
        <button className={styles.action} onClick={() => setFood(item)} aria-label={`Editar cadastro de ${item.name}`}>Editar</button>
      </div>)}
    </section> : null}
    {planEditor ? <NameEditor title={nutrition ? 'Editar plano alimentar' : 'Criar plano alimentar'} label="Nome do plano" initialName={nutrition?.name ?? ''}
      close={() => setPlanEditor(false)} save={(name) => { setNutrition((old) => ({ name, meals: old?.meals ?? [] })); setPlanEditor(false) }} /> : null}
    {meal ? <MealEditor meal={meal} foods={foods} close={() => setMeal(null)} save={(updated) => {
      setNutrition((old) => old ? { ...old, meals: old.meals.some((entry) => entry.id === updated.id) ? old.meals.map((entry) => entry.id === updated.id ? updated : entry) : [...old.meals, updated] } : old)
      setMeal(null)
    }} /> : null}
    {food ? <FoodEditor food={food} close={() => setFood(null)} save={(updated) => {
      setFoods((old) => old.some((entry) => entry.id === updated.id) ? old.map((entry) => entry.id === updated.id ? updated : entry) : [...old, updated])
      setFood(null)
    }} /> : null}
  </>
}
