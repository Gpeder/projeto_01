import { useId, useState } from 'react'
import { personOutline } from 'ionicons/icons'
import Button from '../../components/ui/Button'
import { Icon, Modal, Tabs } from '../../components/student/StudentUi'
import styles from '../../components/student/Student.module.css'
import { formatDate, formatNumber, measurements, photos, weights } from './studentData'

type Measurement = 'waist' | 'chest' | 'arm' | 'thigh'
type Photo = typeof photos[number]
const measurementLabels: Record<Measurement, string> = { waist: 'Cintura', chest: 'Peito', arm: 'Braço', thigh: 'Coxa' }
const tabs = [{ id: 'weight', label: 'Peso' }, { id: 'measurements', label: 'Medidas' }, { id: 'photos', label: 'Fotos' }] as const

function LineChart({ values, label, unit }: { values: { date: string; value: number }[]; label: string; unit: string }) {
  const titleId = useId()
  const descriptionId = useId()
  const numbers = values.map((item) => item.value)
  const minimum = Math.floor(Math.min(...numbers) - .5)
  const maximum = Math.ceil(Math.max(...numbers) + .5)
  const start = Date.parse(values[0].date)
  const end = Date.parse(values[values.length - 1].date)
  const points = values.map((item) => ({ ...item,
    x: end === start ? 375 : 70 + (Date.parse(item.date) - start) / (end - start) * 580,
    y: 180 - (item.value - minimum) / (maximum - minimum) * 150,
  }))
  return <svg role="img" aria-labelledby={`${titleId} ${descriptionId}`} viewBox="0 0 710 225">
    <title id={titleId}>{label}</title>
    <desc id={descriptionId}>{values.map((item) => `${formatDate(item.date)}: ${formatNumber(item.value)} ${unit}`).join('; ')}</desc>
    {[minimum, (minimum + maximum) / 2, maximum].map((value) => {
      const y = 180 - (value - minimum) / (maximum - minimum) * 150
      return <g key={value}><line x1="65" x2="665" y1={y} y2={y} /><text x="55" y={y + 4} textAnchor="end">{formatNumber(value)}</text></g>
    })}
    <polyline points={points.map((point) => `${point.x},${point.y}`).join(' ')} />
    {points.map((point) => <g key={point.date}>
      <circle cx={point.x} cy={point.y} r="4"><title>{formatDate(point.date)}: {formatNumber(point.value)} {unit}</title></circle>
      <text x={point.x} y="210" textAnchor="middle">{formatDate(point.date).replace(/ de 2024$/, '').replace('2024', '')}</text>
    </g>)}
  </svg>
}

function WeightHistory() {
  const [period, setPeriod] = useState(90)
  const lastDate = Date.parse(weights[weights.length - 1].date)
  const filtered = weights.filter((item) => lastDate - Date.parse(item.date) <= period * 86400000)
  const first = filtered[0]
  const last = filtered[filtered.length - 1]
  const change = last.value - first.value
  return <>
    <dl className={styles.metrics}>
      <div><dt>Inicial</dt><dd>{formatNumber(first.value)} kg</dd><small>{formatDate(first.date)}</small></div>
      <div><dt>Recente</dt><dd>{formatNumber(last.value)} kg</dd><small>{formatDate(last.date)}</small></div>
      <div><dt>Variação</dt><dd>{change > 0 ? '+' : ''}{formatNumber(change)} kg</dd><small>no período</small></div>
    </dl>
    <section className={styles.chart}>
      <div className={styles.row}><div><h3>Peso no período</h3><p className={styles.muted}>{formatDate(first.date)} a {formatDate(last.date)}</p></div>
        <label className={styles.field}>Período<select value={period} onChange={(event) => setPeriod(Number(event.target.value))}><option value={30}>1 mês</option><option value={60}>2 meses</option><option value={90}>3 meses</option></select></label>
      </div>
      <LineChart values={filtered} label="Peso no período" unit="kg" />
    </section>
    <table className={styles.table}><caption className="sr-only">Registros de peso no período</caption><thead><tr><th scope="col">Data</th><th scope="col">Peso</th></tr></thead>
      <tbody>{filtered.map((item) => <tr key={item.date}><td><time dateTime={item.date}>{formatDate(item.date)}</time></td><td>{formatNumber(item.value)} kg</td></tr>)}</tbody>
    </table>
  </>
}

function MeasurementHistory() {
  const [measurement, setMeasurement] = useState<Measurement>('waist')
  const values = measurements.flatMap((item) => item[measurement] === null ? [] : [{ date: item.date, value: item[measurement] as number }]).toSorted((a, b) => a.date.localeCompare(b.date))
  return <>
    <label className={`${styles.field} max-w-64`}>Medida para comparação<select value={measurement} onChange={(event) => setMeasurement(event.target.value as Measurement)}>
      {Object.entries(measurementLabels).map(([key, label]) => <option value={key} key={key}>{label}</option>)}
    </select></label>
    {values.length ? <section className={styles.chart}><h3>{measurementLabels[measurement]}</h3><LineChart values={values} label={`Evolução de ${measurementLabels[measurement].toLowerCase()}`} unit="cm" /></section> : <div className={`${styles.empty} mt-6`}><h3>Sem registro de {measurementLabels[measurement].toLowerCase()}</h3></div>}
    <div className={styles.tableScroll} role="region" aria-label="Medidas corporais" tabIndex={0}>
      <table className={styles.table}><caption>Medidas corporais</caption>
        <thead><tr><th scope="col">Data</th>{Object.values(measurementLabels).map((label) => <th scope="col" key={label}>{label}</th>)}</tr></thead>
        <tbody>{measurements.map((item) => <tr key={item.date}>
          <td><time dateTime={item.date}>{formatDate(item.date)}</time></td>
          {(Object.keys(measurementLabels) as Measurement[]).map((key) => <td key={key}>{item[key] === null ? 'Sem registro' : `${formatNumber(item[key])} cm`}</td>)}
        </tr>)}</tbody>
      </table>
    </div>
  </>
}

function PhotoPlaceholder() {
  return <div className={styles.placeholder}><Icon icon={personOutline} size={36} /><span>Sem imagem</span></div>
}

function PhotoHistory() {
  const [comparing, setComparing] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [viewing, setViewing] = useState<Photo[]>([])
  const [error, setError] = useState('')
  const selectedPhotos = photos.filter((photo) => selected.includes(photo.id))
  return <>
    <div className={styles.toolbar}>
      <h3>Fotos de evolução</h3>
      <div className={styles.actions}>
        {comparing ? <Button disabled={selected.length !== 2} onClick={() => setViewing(selectedPhotos)}>Comparar selecionadas</Button> : null}
        <Button variant="secondary" onClick={() => { setComparing(!comparing); setSelected([]); setError('') }}>{comparing ? 'Cancelar comparação' : 'Comparar duas datas'}</Button>
      </div>
    </div>
    {comparing ? <p className={styles.selection} role="status">{selected.length} de 2 fotos selecionadas</p> : null}
    {error ? <p role="alert" className={`${styles.error} mb-4`}>{error}</p> : null}
    <div className={styles.photos}>
      {photos.map((photo) => <button key={photo.id} className={styles.photo} aria-pressed={comparing ? selected.includes(photo.id) : undefined} onClick={() => {
        if (!comparing) { setViewing([photo]); return }
        setError('')
        if (selected.includes(photo.id)) { setSelected(selected.filter((id) => id !== photo.id)); return }
        if (selected.length === 2) { setError('Desmarque uma foto para selecionar outra.'); return }
        if (selectedPhotos.some((item) => item.date === photo.date)) { setError('Selecione fotos de duas datas diferentes.'); return }
        setSelected([...selected, photo.id])
      }}>
        <PhotoPlaceholder /><strong>{formatDate(photo.date)} · {photo.view}</strong><small>{comparing ? selected.includes(photo.id) ? 'Selecionada' : 'Selecionar foto' : 'Visualizar ampliada'}</small>
      </button>)}
    </div>
    {viewing.length ? <Modal wide={viewing.length === 2} title={viewing.length === 2 ? 'Comparar fotos' : 'Foto de evolução'} close={() => setViewing([])} footer={<Button onClick={() => setViewing([])}>Fechar</Button>}>
      <div className={viewing.length === 2 ? styles.comparison : undefined}>{viewing.toSorted((a, b) => a.date.localeCompare(b.date)).map((photo) => <figure key={photo.id}>
        <PhotoPlaceholder /><figcaption className="mt-3 text-sm">{formatDate(photo.date)} · {photo.view}</figcaption>
      </figure>)}</div>
    </Modal> : null}
  </>
}

export default function StudentEvolution() {
  const [section, setSection] = useState<'weight' | 'measurements' | 'photos'>('weight')
  return <>
    <title>Evolução de Gustavo | consta</title>
    <div className={styles.toolbar}><div><p className={styles.eyebrow}>Registros do aluno</p><h2>Evolução de Gustavo</h2></div></div>
    <Tabs label="Registros de evolução" items={[...tabs]} value={section} onChange={setSection}>
      {section === 'weight' ? <WeightHistory /> : section === 'measurements' ? <MeasurementHistory /> : <PhotoHistory />}
    </Tabs>
  </>
}
