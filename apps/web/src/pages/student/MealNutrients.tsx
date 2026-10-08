import styles from '../../components/student/Student.module.css'
import type { Food, Nutrients } from './studentData'
import { formatFoodValue } from './foodDraft'
import { formatMealNutrient } from './nutritionCalculations'

export function MealNutrients({ nutrients }: { nutrients: Nutrients }) {
  return <dl className={styles.portionNutrients}>
    <div><dt>Calorias</dt><dd>{formatMealNutrient(nutrients.kcal, 'kcal')}</dd></div>
    <div className={styles.nutrient} data-nutrient="protein"><dt>Proteínas</dt><dd>{formatMealNutrient(nutrients.protein, 'g')}</dd></div>
    <div className={styles.nutrient} data-nutrient="carbs"><dt>Carboidratos</dt><dd>{formatMealNutrient(nutrients.carbs, 'g')}</dd></div>
    <div className={styles.nutrient} data-nutrient="fat"><dt>Gorduras</dt><dd>{formatMealNutrient(nutrients.fat, 'g')}</dd></div>
  </dl>
}

export function MealFoodSource({ food }: { food: Food }) {
  const snapshot = food.snapshot
  if (!snapshot) return null
  return <p className={styles.muted}>
    Referência: {snapshot.name} · {formatFoodValue(snapshot.reference.quantity, snapshot.reference.unit)} · {snapshot.source === 'manual' ? 'Cadastro manual' : `USDA · FDC ${snapshot.usda?.original.fdcId}`}
    {snapshot.usda?.manuallyEdited ? ' · editado manualmente' : ''}
  </p>
}
