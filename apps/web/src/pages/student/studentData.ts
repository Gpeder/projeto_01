import type { ApiFood } from '../../api/foods.ts'

export type Exercise = {
  id: string
  name: string
  sets: number
  reps: string
  rest: number
  instruction: string
}

export type Workout = { id: string; name: string; description: string; exercises: Exercise[] }
export type Nutrients = { kcal: number | null; protein: number | null; carbs: number | null; fat: number | null }
export type Food = { id: string; name: string; quantity: number; unit: string }
export type CatalogFood = {
  id: string
  name: string
  brand: string
  preparation: string
  amount: number
  unit: string
  nutrients: Nutrients
  usda?: {
    original: ApiFood
    manuallyEdited: boolean
    modifiedFields: string[]
    referenceReviewed: boolean
  }
}
export type Meal = {
  id: string
  name: string
  time: string
  guidance: string
  nutrients: Nutrients
  foods: Food[]
}
export type NutritionPlan = { name: string; calorieLimit: number | null; meals: Meal[] }
export type Session = {
  id: string
  date: string
  workout: string
  duration: number
  sets: number
  note: string
  exercises: { name: string; planned: string; performed: string | null }[]
}

export const student = {
  id: 'gustavo',
  name: 'Gustavo',
  objective: 'Ganhar força e melhorar a composição corporal',
  weeklyGoal: 3,
}

export const initialWorkouts: Workout[] = [
  { id: 'a', name: 'Treino A — Peito e tríceps', description: 'Ênfase em força e controle de movimento.', exercises: [
    { id: 'a1', name: 'Supino reto', sets: 4, reps: '8–10', rest: 90, instruction: 'Manter escápulas apoiadas.' },
    { id: 'a2', name: 'Supino inclinado com halteres', sets: 3, reps: '10–12', rest: 75, instruction: '' },
    { id: 'a3', name: 'Tríceps na polia', sets: 3, reps: '12', rest: 60, instruction: '' },
  ] },
  { id: 'b', name: 'Treino B — Costas e bíceps', description: 'Puxadas, remadas e acessórios.', exercises: [
    { id: 'b1', name: 'Puxada frontal', sets: 4, reps: '8–10', rest: 90, instruction: '' },
    { id: 'b2', name: 'Remada baixa', sets: 4, reps: '10–12', rest: 75, instruction: 'Evitar inclinar o tronco.' },
    { id: 'b3', name: 'Rosca direta', sets: 3, reps: '10', rest: 60, instruction: '' },
  ] },
  { id: 'c', name: 'Treino C — Pernas', description: 'Treino de membros inferiores.', exercises: [
    { id: 'c1', name: 'Agachamento livre', sets: 4, reps: '8–10', rest: 90, instruction: 'Amplitude confortável.' },
    { id: 'c2', name: 'Leg press 45°', sets: 3, reps: '10–12', rest: 90, instruction: '' },
    { id: 'c3', name: 'Mesa flexora', sets: 3, reps: '12', rest: 60, instruction: '' },
  ] },
]

export const sessions: Session[] = [
  { id: 's1', date: '2024-06-26', workout: 'Treino B — Costas e bíceps', duration: 54, sets: 20,
    note: 'Treino confortável. A última série de remada exigiu mais esforço.', exercises: [
      { name: 'Puxada frontal', planned: '4 × 8–10', performed: '45 kg × 10, 10, 9, 8' },
      { name: 'Remada baixa', planned: '4 × 10–12', performed: '40 kg × 12, 12, 11, 10' },
      { name: 'Rosca direta', planned: '3 × 10', performed: '18 kg × 10, 10, 9' },
    ] },
  { id: 's2', date: '2024-06-24', workout: 'Treino A — Peito e tríceps', duration: 48, sets: 18,
    note: 'Sem observações.', exercises: initialWorkouts[0].exercises.map((exercise) => ({
      name: exercise.name, planned: `${exercise.sets} × ${exercise.reps}`, performed: null,
    })) },
  { id: 's3', date: '2024-06-18', workout: 'Treino C — Pernas', duration: 52, sets: 17,
    note: 'Reduzi a carga no agachamento por conforto.', exercises: initialWorkouts[2].exercises.map((exercise) => ({
      name: exercise.name, planned: `${exercise.sets} × ${exercise.reps}`, performed: null,
    })) },
]

export const initialNutrition: NutritionPlan = {
  name: 'Plano alimentar — Junho',
  calorieLimit: null,
  meals: [
    { id: 'breakfast', name: 'Café da manhã', time: '07:30', guidance: '',
      nutrients: { kcal: 430, protein: 28, carbs: 52, fat: 12 }, foods: [
        { id: 'f1', name: 'Iogurte natural', quantity: 170, unit: 'g' },
        { id: 'f2', name: 'Banana', quantity: 1, unit: 'unidade' },
        { id: 'f3', name: 'Aveia em flocos', quantity: 30, unit: 'g' },
      ] },
    { id: 'lunch', name: 'Almoço', time: '12:30', guidance: '',
      nutrients: { kcal: 710, protein: 52, carbs: 78, fat: 20 }, foods: [
        { id: 'f4', name: 'Arroz integral cozido', quantity: 150, unit: 'g' },
        { id: 'f5', name: 'Feijão carioca cozido', quantity: 100, unit: 'g' },
        { id: 'f6', name: 'Peito de frango grelhado', quantity: 160, unit: 'g' },
      ] },
    { id: 'snack', name: 'Lanche', time: '16:30', guidance: '',
      nutrients: { kcal: 320, protein: 20, carbs: 40, fat: 8 }, foods: [
        { id: 'f7', name: 'Pão integral', quantity: 2, unit: 'fatia' },
        { id: 'f8', name: 'Queijo branco', quantity: 40, unit: 'g' },
      ] },
    { id: 'dinner', name: 'Jantar', time: '20:00', guidance: '',
      nutrients: { kcal: 640, protein: 40, carbs: 60, fat: 25 }, foods: [
        { id: 'f9', name: 'Batata assada', quantity: 220, unit: 'g' },
        { id: 'f10', name: 'Carne bovina grelhada', quantity: 150, unit: 'g' },
        { id: 'f11', name: 'Salada variada', quantity: 1, unit: 'porção' },
      ] },
  ],
}

export const weights = [
  { date: '2024-05-03', value: 72.4 }, { date: '2024-05-20', value: 72 },
  { date: '2024-06-06', value: 71.4 }, { date: '2024-06-26', value: 70.8 },
]
export const measurements = [
  { date: '2024-06-26', waist: 78, chest: 92, arm: 31, thigh: null },
  { date: '2024-05-18', waist: 79, chest: 91, arm: 30.5, thigh: null },
]
export const photos = [
  { id: 'p1', date: '2024-06-26', view: 'Frente' },
  { id: 'p2', date: '2024-06-26', view: 'Lado' },
  { id: 'p3', date: '2024-05-18', view: 'Frente' },
  { id: 'p4', date: '2024-05-18', view: 'Costas' },
]

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
export const numberFormatter = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 })
export function formatDate(date: string) { return dateFormatter.format(new Date(`${date}T12:00:00Z`)) }
export function formatNumber(value: number | null) { return value === null ? 'Não informado' : numberFormatter.format(value) }
export function sumNutrients(meals: Meal[]): Nutrients {
  const add = (a: number | null, b: number | null) => a === null || b === null ? null : a + b
  return meals.reduce<Nutrients>((total, meal) => ({
    kcal: add(total.kcal, meal.nutrients.kcal),
    protein: add(total.protein, meal.nutrients.protein),
    carbs: add(total.carbs, meal.nutrients.carbs),
    fat: add(total.fat, meal.nutrients.fat),
  }), { kcal: 0, protein: 0, carbs: 0, fat: 0 })
}
