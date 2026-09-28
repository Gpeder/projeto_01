import { useId, type ComponentPropsWithRef, type ReactNode } from 'react'
import styles from './Button.module.css'

export type ButtonProps = ComponentPropsWithRef<'button'> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  loadingLabel?: string
  children: ReactNode
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingLabel = 'Carregando…',
  disabled = false,
  type = 'button',
  children,
  className,
  'aria-busy': ariaBusy,
  'aria-describedby': ariaDescribedBy,
  ...props
}: ButtonProps) {
  const statusId = useId()
  const description = [ariaDescribedBy, loading ? statusId : undefined]
    .filter(Boolean)
    .join(' ') || undefined

  return (
    <>
      <button
        {...props}
        type={type}
        disabled={disabled || loading}
        aria-busy={loading || ariaBusy}
        aria-describedby={description}
        data-loading={loading}
        className={[styles.button, styles[variant], styles[size], className]
          .filter(Boolean)
          .join(' ')}
      >
        <span className={styles.label}>{children}</span>
        <span className={styles.loadingLabel} aria-hidden="true">
          {loadingLabel}
        </span>
      </button>
      <span id={statusId} className={styles.status} role="status" aria-atomic="true">
        {loading ? loadingLabel : ''}
      </span>
    </>
  )
}
