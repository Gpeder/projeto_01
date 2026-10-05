import { createElement, useEffect, useId, useRef, type ReactNode } from 'react'
import { closeOutline } from 'ionicons/icons'
import Button from '../ui/Button'
import styles from './Student.module.css'

export function Icon({ icon, size = 18 }: { icon: string; size?: number }) {
  return createElement('ion-icon', { icon, style: { fontSize: size, flexShrink: 0 }, 'aria-hidden': 'true' })
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className={styles.eyebrow}>{children}</h2>
}

export function Modal({ title, children, close, footer, wide = false }: {
  title: string; children: ReactNode; close: () => void; footer?: ReactNode; wide?: boolean
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    dialog?.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      dialog?.close()
      document.body.style.overflow = previousOverflow
      if (opener?.isConnected) opener.focus()
    }
  }, [])

  return (
    <dialog ref={ref} aria-labelledby={titleId} className={`${styles.modal} ${wide ? styles.wide : ''}`}
      onCancel={(event) => { event.preventDefault(); close() }}>
      <header className={styles.modalHeader}>
        <h2 id={titleId}>{title}</h2>
        <Button variant="ghost" onClick={close} aria-label="Fechar"><Icon icon={closeOutline} size={22} /></Button>
      </header>
      <div className={styles.modalBody}>{children}</div>
      {footer ? <footer className={styles.modalFooter}>{footer}</footer> : null}
    </dialog>
  )
}

export function Tabs<T extends string>({ label, items, value, onChange, children }: {
  label: string; items: { id: T; label: string }[]; value: T; onChange: (value: T) => void; children: ReactNode
}) {
  const id = useId()
  return <>
    <div role="tablist" aria-label={label} className={styles.tabs} onKeyDown={(event) => {
      const index = items.findIndex((item) => item.id === value)
      const keys: Record<string, number> = { ArrowRight: (index + 1) % items.length, ArrowLeft: (index - 1 + items.length) % items.length, Home: 0, End: items.length - 1 }
      if (!(event.key in keys)) return
      event.preventDefault()
      const next = items[keys[event.key]]
      onChange(next.id)
      document.getElementById(`${id}-${next.id}`)?.focus()
    }}>
      {items.map((item) => <button key={item.id} id={`${id}-${item.id}`} type="button" role="tab"
        tabIndex={value === item.id ? 0 : -1} aria-selected={value === item.id} aria-controls={`${id}-panel`}
        onClick={() => onChange(item.id)}>{item.label}</button>)}
    </div>
    <div role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-${value}`} tabIndex={0} className={styles.tabContent}>{children}</div>
  </>
}
