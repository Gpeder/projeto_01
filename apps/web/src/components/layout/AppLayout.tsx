import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import Button from '../ui/Button'
import Sidebar from './Sidebar'

export default function AppLayout({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    const theme = document.documentElement.dataset.theme
    return theme ? theme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  const menuId = useId()
  const menuTitleId = useId()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const desktopSidebarRef = useRef<HTMLElement>(null)

  useEffect(() => {
    let frame = window.requestAnimationFrame(() => {
      frame = window.requestAnimationFrame(() => {
        document.documentElement.dataset.themeTransitions = 'true'
      })
    })

    return () => {
      window.cancelAnimationFrame(frame)
      delete document.documentElement.dataset.themeTransitions
    }
  }, [])

  useEffect(() => {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')

    function followSystemTheme(event: MediaQueryListEvent) {
      if (!document.documentElement.dataset.theme) setIsDarkTheme(event.matches)
    }

    systemTheme.addEventListener('change', followSystemTheme)
    return () => systemTheme.removeEventListener('change', followSystemTheme)
  }, [])

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 801px)')

    function closeOnDesktop() {
      if (desktop.matches && dialogRef.current?.open) dialogRef.current.close()
    }

    desktop.addEventListener('change', closeOnDesktop)
    return () => desktop.removeEventListener('change', closeOnDesktop)
  }, [])

  useEffect(() => {
    if (!menuOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previousOverflow }
  }, [menuOpen])

  function openMenu() {
    dialogRef.current?.showModal()
    setMenuOpen(true)
    closeButtonRef.current?.focus()
  }

  function closeMenu() {
    dialogRef.current?.close()
  }

  function toggleTheme() {
    const theme = isDarkTheme ? 'light' : 'dark'
    document.documentElement.dataset.theme = theme
    setIsDarkTheme(theme === 'dark')

    try {
      localStorage.setItem('consta:theme', theme)
    } catch {
    }
  }

  function handleMenuKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== 'Tab') return

    const controls = event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), a[href]')
    const first = controls[0]
    const last = controls[controls.length - 1]

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last?.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first?.focus()
    }
  }

  function handleMenuClosed() {
    setMenuOpen(false)

    if (triggerRef.current?.getClientRects().length) {
      triggerRef.current.focus()
    } else {
      desktopSidebarRef.current?.querySelector<HTMLAnchorElement>('a[aria-current="page"]')?.focus()
    }
  }

  return (
    <div className="min-h-svh">
      <a
        href="#main-content"
        className="sr-only z-30 rounded-lg bg-surface px-4 py-3 font-medium focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Pular para o conteúdo
      </a>

      <aside
        ref={desktopSidebarRef}
        className="fixed inset-y-0 left-0 hidden w-58 flex-col overflow-y-auto border-r border-border bg-surface px-4 pt-7 pb-5 min-[801px]:flex"
      >
        <Sidebar isDarkTheme={isDarkTheme} onToggleTheme={toggleTheme} />
      </aside>

      <div className="min-[801px]:ml-58">
        <header className="border-b border-border bg-surface px-5 py-3 min-[801px]:hidden">
          <Button
            ref={triggerRef}
            variant="secondary"
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            onClick={openMenu}
          >
            Abrir menu
          </Button>
        </header>
        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto max-w-290 px-5 pt-7 pb-18 max-[391px]:px-4 min-[801px]:px-8 min-[801px]:pt-12 min-[951px]:px-12"
        >
          {children}
        </main>
      </div>

      <dialog
        ref={dialogRef}
        id={menuId}
        aria-labelledby={menuTitleId}
        onClose={handleMenuClosed}
        onKeyDown={handleMenuKeyDown}
        className="fixed inset-y-0 left-0 m-0 h-dvh max-h-none w-56 max-w-[calc(100vw-2rem)] overflow-y-auto border-0 border-r border-border bg-surface px-4 pt-7 pb-5 text-foreground opacity-0 transition-[background-color,border-color,color,opacity] duration-(--duration-slow) ease-out open:flex open:flex-col open:opacity-100 backdrop:bg-background/80 motion-reduce:transition-none starting:open:opacity-0"
      >
        <div className="mb-6 flex shrink-0 items-center justify-between gap-2">
          <h2 id={menuTitleId} className="text-base">Menu</h2>
          <Button ref={closeButtonRef} variant="ghost" onClick={closeMenu} aria-label="Fechar menu">
            Fechar
          </Button>
        </div>
        <Sidebar isDarkTheme={isDarkTheme} onToggleTheme={toggleTheme} onNavigate={closeMenu} />
      </dialog>
    </div>
  )
}
