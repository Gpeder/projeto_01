import { createElement } from 'react'
import { NavLink } from 'react-router'
import { defineCustomElement } from 'ionicons/components/ion-icon.js'
import {
  ellipsisHorizontal,
  gridOutline,
  moonOutline,
  peopleOutline,
  settingsOutline,
  sunnyOutline,
} from 'ionicons/icons'

defineCustomElement()

type MenuItem = {
  label: string
  icon: string
  to: string
}

const menuItems: MenuItem[] = [
  { label: 'Visão geral', icon: gridOutline, to: '/' },
  { label: 'Alunos', icon: peopleOutline, to: '/alunos' },
  { label: 'Configurações', icon: settingsOutline, to: '/configuracoes' },
]

const menuItemClassName = 'flex min-h-11 items-center gap-[0.8125rem] rounded-lg px-3 py-2 text-left text-sm font-medium text-muted'

type SidebarProps = {
  isDarkTheme: boolean
  onToggleTheme: () => void
  onNavigate?: () => void
}

export default function Sidebar({ isDarkTheme, onToggleTheme, onNavigate }: SidebarProps) {
  return (
    <>
      <p className="grid shrink-0 grid-cols-[1.875rem_auto] items-center gap-x-2.5 px-2.5 pb-8.5 font-heading font-semibold">
        <span
          aria-hidden="true"
          className="row-span-2 grid size-7.5 place-items-center rounded-lg bg-primary text-[0.9375rem] text-on-primary"
        >
          C
        </span>
        <span className="text-[1.3125rem] tracking-[-0.04375rem]">consta</span>
        <span className="col-start-2 -mt-0.75 font-sans text-[0.5rem] font-normal tracking-[0.0875rem] text-muted">
          PROFISSIONAL
        </span>
      </p>
      <nav aria-label="Principal" className="flex shrink-0 flex-col gap-1">
        {menuItems.map(({ label, icon, to }) => (
          <NavLink
            key={label}
            to={to}
            end={to !== '/alunos'}
            onClick={onNavigate}
            className={`${menuItemClassName} transition-[background-color,color,opacity] duration-(--duration-slow) ease-standard hover:bg-surface-muted hover:text-foreground active:opacity-80 aria-[current=page]:bg-surface-muted aria-[current=page]:font-semibold aria-[current=page]:text-foreground motion-reduce:transition-none`}
          >
            {createElement('ion-icon', {
              icon,
              class: 'size-5 shrink-0',
              'aria-hidden': 'true',
            })}
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto shrink-0 pt-6">
        <div className="border-t border-border pt-3">
          <button
            type="button"
            onClick={onToggleTheme}
            className={`${menuItemClassName} w-full cursor-pointer transition-[background-color,color,opacity] duration-(--duration-slow) ease-standard hover:bg-surface-muted hover:text-foreground active:opacity-80 motion-reduce:transition-none`}
          >
            <span aria-hidden="true" className="pointer-events-none relative size-5 shrink-0">
              <span
                className={`absolute inset-0 transition-[opacity,rotate] duration-(--duration-slow) ease-standard motion-reduce:transition-none ${isDarkTheme ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'}`}
              >
                {createElement('ion-icon', {
                  icon: sunnyOutline,
                  class: 'size-5',
                  'aria-hidden': 'true',
                })}
              </span>
              <span
                className={`absolute inset-0 transition-[opacity,rotate] duration-(--duration-slow) ease-standard motion-reduce:transition-none ${isDarkTheme ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'}`}
              >
                {createElement('ion-icon', {
                  icon: moonOutline,
                  class: 'size-5',
                  'aria-hidden': 'true',
                })}
              </span>
            </span>
            <span>{isDarkTheme ? 'Tema claro' : 'Tema escuro'}</span>
          </button>
          <div className="mt-2 flex items-center gap-1.5 rounded-lg px-2 py-2.5">
            <span
              aria-hidden="true"
              className="grid size-8.5 shrink-0 place-items-center rounded-full bg-primary font-semibold text-on-primary"
            >
              P
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate text-sm font-semibold">Profissional</span>
              <span className="truncate text-[0.6875rem] text-muted">Modo demonstração</span>
            </div>
            {createElement('ion-icon', {
              icon: ellipsisHorizontal,
              class: 'size-4.5 shrink-0 text-muted',
              'aria-hidden': 'true',
            })}
          </div>
        </div>
      </div>
    </>
  )
}
