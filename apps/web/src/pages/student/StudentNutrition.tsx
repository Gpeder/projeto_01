import { useState } from 'react'
import { addOutline } from 'ionicons/icons'
import Button from '../../components/ui/Button'
import { Icon } from '../../components/student/StudentUi'
import styles from '../../components/student/Student.module.css'
import { formatNumber, type CatalogFood, type Meal } from './studentData'
import { useStudent } from './StudentPage'
import { MealEditor } from './StudentEditors'
import FoodEditor from './FoodEditor'
import NutritionPlanEditor from './NutritionPlanEditor'
import { formatFoodValue } from './foodDraft'
import { calculateFoodNutrients, calorieDifference, emptyNutrients, formatMealNutrient, mealNutrients, sumNutrients } from './nutritionCalculations'
import { MealFoodSource, MealNutrients } from './MealNutrients'

function MealSection({ meal, edit, remove }: { meal: Meal; edit: () => void; remove: () => void }) {
  const totals = mealNutrients(meal)
  return <section className={styles.meal} aria-label={meal.name}>
    <div className={styles.mealHeading}>
      <div>{meal.time ? <time>{meal.time}</time> : null}<h3>{meal.name}</h3></div>
      <div><strong>{formatMealNutrient(totals.kcal, 'kcal')} planejadas</strong><div><button className={styles.action} onClick={edit} aria-label={`Editar ${meal.name}`}>Editar refeição</button></div></div>
    </div>
    <p className={styles.mealMode}>{meal.totalsMode === 'calculated' ? 'Totais calculados pelos alimentos' : 'Totais manuais'}</p>
    <MealNutrients nutrients={totals} />
    {meal.guidance ? <p className={styles.muted}>{meal.guidance}</p> : null}
    {meal.foods.length > 0 ? <ul>{meal.foods.map((entry) => <li key={entry.id} className={`${styles.food} ${styles.mealFood}`}>
      <div className={styles.mealFoodDetails}>
        <p>{entry.name} · {formatFoodValue(entry.quantity, entry.unit)}</p>
        {entry.snapshot ? <><MealFoodSource food={entry} /><MealNutrients nutrients={calculateFoodNutrients(entry)} /></>
          : <p className={styles.muted}>Sem referência nutricional. Vincule um alimento cadastrado no editor para calcular.</p>}
      </div>
      <button className={styles.action} onClick={edit} aria-label={`Editar ${entry.name} em ${meal.name}`}>Editar</button>
    </li>)}</ul> : <p className={styles.mealNotice}>Nenhum alimento adicionado.{meal.totalsMode === 'calculated' ? ' Inclua alimentos para obter os totais.' : ' Os valores acima foram informados manualmente.'}</p>}
    <button className={`${styles.action} text-error`} onClick={remove}>Remover refeição</button>
  </section>
}

export default function StudentNutrition() {
  const { nutrition, setNutrition, foods, setFoods } = useStudent()
  const [meal, setMeal] = useState<Meal | null>(null)
  const [food, setFood] = useState<CatalogFood | null>(null)
  const [planEditor, setPlanEditor] = useState(false)
  const totals = nutrition ? sumNutrients(nutrition.meals) : null
  const difference = nutrition && totals ? calorieDifference(totals, nutrition.calorieLimit) : null
  const calorieStatus = difference === null ? 'Complete os dados nutricionais das refeições para comparar.'
    : difference < 0 ? `${formatNumber(Math.abs(difference))} kcal acima do limite`
    : difference > 0 ? `${formatNumber(difference)} kcal abaixo do limite`
    : 'Planejado igual ao limite'
  const addMeal = () => setMeal({ id: crypto.randomUUID(), name: '', time: '', guidance: '', totalsMode: 'calculated', foods: [], nutrients: emptyNutrients() })
  const addFood = () => setFood({ id: crypto.randomUUID(), name: '', brand: '', preparation: '', amount: 100, unit: 'g', nutrients: { kcal: null, protein: null, carbs: null, fat: null } })

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
        <div><dt>Planejado no dia</dt><dd>{nutrition.meals.length === 0 ? 'Sem refeições' : formatMealNutrient(totals.kcal, 'kcal')}</dd>
          <dd className={styles.calorieDetails}>
            <span>Limite diário: {nutrition.calorieLimit === null ? 'não definido' : formatFoodValue(nutrition.calorieLimit, 'kcal')}</span>
            {nutrition.calorieLimit !== null ? <span className={difference !== null && difference < 0 ? styles.overLimit : undefined}>{calorieStatus}</span>
              : <button className={styles.limitAction} onClick={() => setPlanEditor(true)}>Definir limite</button>}
          </dd>
        </div>
        <div className={styles.nutrient} data-nutrient="protein"><dt>Proteínas</dt><dd>{formatMealNutrient(totals.protein, 'g')}</dd></div>
        <div className={styles.nutrient} data-nutrient="carbs"><dt>Carboidratos</dt><dd>{formatMealNutrient(totals.carbs, 'g')}</dd></div>
        <div className={styles.nutrient} data-nutrient="fat"><dt>Gorduras</dt><dd>{formatMealNutrient(totals.fat, 'g')}</dd></div>
      </dl>
      {nutrition.meals.length ? nutrition.meals.map((item) => <MealSection key={item.id} meal={item} edit={() => setMeal(item)} remove={() => {
        if (window.confirm(`Remover ${item.name} do plano?`)) setNutrition((previous) => previous ? { ...previous, meals: previous.meals.filter((entry) => entry.id !== item.id) } : previous)
      }} />) : <div className={styles.empty}><h3>Nenhuma refeição adicionada</h3><Button onClick={addMeal}>Adicionar refeição</Button></div>}
      <div className={styles.destructive}><strong>Remover plano atual</strong><Button variant="destructive" onClick={() => {
        if (window.confirm('Remover o plano alimentar atual?')) setNutrition(null)
      }}>Remover plano</Button></div>
    </> : <section className={styles.empty}><h3>Sem plano alimentar</h3><Button onClick={() => setPlanEditor(true)}>Criar plano</Button></section>}
    {foods.length ? <section className={styles.section}>
      <div className={styles.row}><h2>Alimentos cadastrados</h2><Button variant="secondary" onClick={addFood}>Cadastrar alimento</Button></div>
      {foods.map((item) => <div className={styles.food} key={item.id}>
        <div><strong>{item.name}</strong><p>{formatFoodValue(item.amount, item.unit)} · {item.nutrients.kcal === null ? 'Calorias não informadas' : formatFoodValue(item.nutrients.kcal, 'kcal')}</p>
          {Object.values(item.nutrients).some((value) => value === null) ? <p>Informações nutricionais incompletas</p> : null}
          {item.usda ? <p>{item.usda.manuallyEdited ? 'Origem USDA · editado manualmente' : 'Dados USDA'} · FDC {item.usda.original.fdcId}</p> : null}
        </div>
        <button className={styles.action} onClick={() => setFood(item)} aria-label={`Editar cadastro de ${item.name}`}>Editar</button>
      </div>)}
    </section> : null}
    {planEditor ? <NutritionPlanEditor plan={nutrition}
      close={() => setPlanEditor(false)} save={(details) => { setNutrition((old) => ({ ...details, meals: old?.meals ?? [] })); setPlanEditor(false) }} /> : null}
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
