import { useId, useRef, useState } from 'react'
import Button from '../../components/ui/Button'
import { Modal, Tabs } from '../../components/student/StudentUi'
import styles from '../../components/student/Student.module.css'
import type { CatalogFood } from './studentData'
import type { ApiFood } from '../../api/foods'
import { foodNutrientFields, formatFoodValue, hasFoodContent, importFood, needsReferenceReview, saveFoodDraft, toFoodDraft, type FoodDraft } from './foodDraft'
import { useFoodSearch } from './useFoodSearch'

const modes = [{ id: 'manual', label: 'Preencher manualmente' }, { id: 'usda', label: 'Buscar na USDA' }] as const

function referenceLabel(food: ApiFood) {
  return food.reference.quantity !== null && food.reference.unit !== null
    ? formatFoodValue(food.reference.quantity, food.reference.unit) : 'Referência nutricional desconhecida'
}

export default function FoodEditor({ food, close, save }: { food: CatalogFood; close: () => void; save: (food: CatalogFood) => void }) {
  const [draft, setDraft] = useState(() => toFoodDraft(food))
  const currentDraft = useRef(draft)
  const nameInput = useRef<HTMLInputElement>(null)
  const submitting = useRef(false)
  const [dirty, setDirty] = useState(false)
  const [mode, setMode] = useState<'manual' | 'usda'>('manual')
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const formId = useId()
  const hintId = useId()
  const { searchState, detailsState, search, select, cancel } = useFoodSearch()
  const searching = searchState.status === 'loading'
  const loadingDetails = detailsState.status === 'loading'
  const reviewRequired = needsReferenceReview(draft)

  function replaceDraft(next: FoodDraft) {
    currentDraft.current = next
    setDraft(next)
    setDirty(true)
    setError('')
  }

  function edit(next: FoodDraft) {
    replaceDraft({ ...next, usda: next.usda ? { ...next.usda, manuallyEdited: true, referenceReviewed: false } : undefined })
  }

  function switchMode(next: 'manual' | 'usda') {
    cancel()
    setMode(next)
  }

  function attemptClose() {
    if (dirty && !window.confirm('Descartar alterações não salvas?')) return
    cancel()
    close()
  }

  async function choose(result: ApiFood) {
    setNotice('')
    const selected = await select(result)
    if (!selected) return
    if (hasFoodContent(currentDraft.current) && !window.confirm('Substituir os dados preenchidos pelas informações deste alimento da USDA?')) {
      setNotice('Os dados preenchidos foram mantidos.')
      return
    }
    replaceDraft(importFood(food.id, selected))
    setNotice('Informações carregadas. Revise os campos e confirme em Salvar alimento.')
    nameInput.current?.focus()
  }

  return <Modal title={food.name ? 'Editar alimento' : 'Cadastrar alimento'} close={attemptClose}
    footer={<><Button variant="secondary" onClick={attemptClose}>Cancelar</Button><Button type="submit" form={formId} disabled={loadingDetails || !draft.name.trim()}>Salvar alimento</Button></>}>
    <div className={styles.foodModes}><Tabs label="Como preencher o alimento" items={[...modes]} value={mode} onChange={switchMode}>
      {mode === 'manual' ? <p className={styles.muted}>Informe os nutrientes para a quantidade de referência escolhida.</p> : <section className={styles.foodSearch} aria-label="Busca na USDA">
        <form className={styles.form} onSubmit={(event) => { event.preventDefault(); setNotice(''); void search(query) }}>
          <label>Alimento na USDA<input type="search" required maxLength={200} value={query} aria-describedby={hintId} onChange={(event) => { cancel(); setQuery(event.target.value) }} /></label>
          <p id={hintId} className={styles.muted}>A busca inicial utiliza termos em inglês, como “rice cooked”.</p>
          <div className={styles.actions}>
            <Button type="submit" loading={searching} loadingLabel="Buscando alimentos…" disabled={!query.trim()}>Buscar</Button>
            {searching || loadingDetails ? <Button variant="ghost" onClick={cancel}>Cancelar consulta</Button> : null}
          </div>
        </form>
        <div className={styles.searchResults} aria-busy={searching}>
          {searchState.status === 'idle' ? <p className={styles.muted}>Digite um alimento e acione Buscar para consultar a USDA.</p> : null}
          {searchState.status === 'error' ? <div className={styles.searchFeedback}>
            <p role="alert" className={styles.error}>{searchState.message}</p>
            <div className={styles.actions}><Button variant="secondary" onClick={() => void search(searchState.query, searchState.page)}>Tentar novamente</Button><Button variant="ghost" onClick={() => switchMode('manual')}>Preencher manualmente</Button></div>
          </div> : null}
          {searchState.status === 'success' ? <>
            <p role="status" className={styles.muted}>{searchState.data.items.length ? `Resultados para “${searchState.query}”` : 'Nenhum alimento encontrado. Tente outro termo em inglês ou preencha manualmente.'}</p>
            {searchState.data.items.length ? <>
              <ul className={styles.foodResults}>{searchState.data.items.map((result) => <li key={result.fdcId}>
                <div><strong>{result.name}</strong>{result.brand ? <p>{result.brand}</p> : null}<p>{referenceLabel(result)}</p></div>
                <Button variant="secondary" size="sm" disabled={loadingDetails && detailsState.food.fdcId === result.fdcId} aria-busy={loadingDetails && detailsState.food.fdcId === result.fdcId} aria-label={`Selecionar ${result.name}`} onClick={() => void choose(result)}>Selecionar</Button>
              </li>)}</ul>
              <nav className={styles.searchPagination} aria-label="Páginas da busca de alimentos">
                <Button variant="secondary" size="sm" disabled={searchState.data.page <= 1} onClick={() => void search(searchState.query, searchState.data.page - 1)}>Anterior</Button>
                <span>Página {searchState.data.page} de {searchState.data.totalPages}</span>
                <Button variant="secondary" size="sm" disabled={searchState.data.page >= Math.min(searchState.data.totalPages, 999999)} onClick={() => void search(searchState.query, searchState.data.page + 1)}>Próxima</Button>
              </nav>
            </> : <Button variant="ghost" onClick={() => switchMode('manual')}>Preencher manualmente</Button>}
          </> : null}
        </div>
        <div className={styles.detailStatus}>
          <p role="status" className={styles.muted}>{loadingDetails ? <><span className={styles.loadingIndicator} aria-hidden="true" />Carregando informações nutricionais…</> : notice}</p>
          {detailsState.status === 'error' ? <div className={styles.searchFeedback}>
            <p role="alert" className={styles.error}>Falha ao carregar informações nutricionais. {detailsState.message}</p>
            <div className={styles.actions}><Button variant="secondary" onClick={() => void choose(detailsState.food)}>Tentar novamente</Button><Button variant="ghost" onClick={() => switchMode('manual')}>Preencher manualmente</Button></div>
          </div> : null}
        </div>
      </section>}
    </Tabs></div>
    <form id={formId} className={`${styles.form} ${styles.foodForm}`} onSubmit={(event) => {
      event.preventDefault()
      if (submitting.current || loadingDetails) return
      try {
        const updated = saveFoodDraft(currentDraft.current)
        submitting.current = true
        cancel()
        save(updated)
      } catch (failure) {
        submitting.current = false
        setError(failure instanceof Error ? failure.message : 'Confira os campos do alimento.')
      }
    }}>
      {draft.usda ? <div className={styles.foodSource}>
        <p>{draft.usda.manuallyEdited ? 'Origem USDA · cadastro editado manualmente' : 'Importado da USDA · revise antes de salvar'}</p>
        <details><summary>Consultar dados originais da USDA</summary>
          <p>{draft.usda.original.name}</p>
          {draft.usda.original.brand ? <p>Marca: {draft.usda.original.brand}</p> : null}
          {draft.usda.original.brandOwner ? <p>Proprietário: {draft.usda.original.brandOwner}</p> : null}
          <p>FDC {draft.usda.original.fdcId} · {draft.usda.original.dataType ?? 'Tipo não informado'}</p>
          <p>{referenceLabel(draft.usda.original)}</p>
          <p>Calorias: {formatFoodValue(draft.usda.original.nutrients.energyKcal, 'kcal')} · Proteínas: {formatFoodValue(draft.usda.original.nutrients.proteinG, 'g')} · Carboidratos: {formatFoodValue(draft.usda.original.nutrients.carbohydrateG, 'g')} · Gorduras: {formatFoodValue(draft.usda.original.nutrients.fatG, 'g')}</p>
        </details>
      </div> : null}
      <label>Nome do alimento<input ref={nameInput} required maxLength={1000} value={draft.name} onChange={(event) => edit({ ...draft, name: event.target.value })} /></label>
      <div className={styles.formGrid}>
        <label>Marca (opcional)<input maxLength={300} value={draft.brand} onChange={(event) => edit({ ...draft, brand: event.target.value })} /></label>
        <label>Preparo (opcional)<input maxLength={300} value={draft.preparation} onChange={(event) => edit({ ...draft, preparation: event.target.value })} /></label>
        <label>Quantidade de referência<input required type="number" min={0} step="any" value={draft.amount} onChange={(event) => edit({ ...draft, amount: event.target.value })} /></label>
        <label>Unidade<select required value={draft.unit} onChange={(event) => edit({ ...draft, unit: event.target.value })}>
          <option value="">Selecionar unidade</option>{['g', 'ml', 'unidade', 'fatia', 'porção'].map((unit) => <option key={unit}>{unit}</option>)}
        </select></label>
      </div>
      <h3>Nutrientes na quantidade de referência</h3>
      <p className={styles.muted}>Deixe vazio o que não foi informado. Zero significa um valor conhecido. Alterar a quantidade ou unidade exige revisar os nutrientes; os valores não são recalculados.</p>
      <div className={styles.formGrid}>{foodNutrientFields.map(({ key, label }) => <label key={key} className={styles.nutrient} data-nutrient={key}>{label}
        <input type="number" min={0} step="any" placeholder="Não informado" value={draft.nutrients[key]} onChange={(event) => edit({ ...draft, nutrients: { ...draft.nutrients, [key]: event.target.value } })} />
      </label>)}</div>
      {reviewRequired ? <div className={styles.foodSource}>
        <p>{draft.usda?.original.reference.quantity === null || draft.usda?.original.reference.unit === null ? 'A referência nutricional da USDA é desconhecida.' : 'A referência foi alterada em relação à USDA.'} Confira a quantidade, a unidade e cada nutriente antes de salvar. Não há conversão automática entre unidades.</p>
        <label className={styles.reviewCheck}><input type="checkbox" required checked={draft.usda?.referenceReviewed ?? false} onChange={(event) => replaceDraft({ ...draft, usda: draft.usda ? { ...draft.usda, referenceReviewed: event.target.checked } : undefined })} />Revisei os nutrientes para a quantidade e unidade informadas.</label>
      </div> : null}
      <p className={styles.muted}>O cadastro fica disponível somente nesta sessão da página.</p>
      {error ? <p role="alert" className={styles.error}>{error}</p> : null}
    </form>
  </Modal>
}
