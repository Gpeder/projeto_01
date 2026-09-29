import { createElement } from 'react'
import { NavLink } from 'react-router'
import { defineCustomElement } from 'ionicons/components/ion-icon.js'
import {
  barbellOutline,
  ellipsisHorizontal,
  flagOutline,
  gridOutline,
  moonOutline,
  restaurantOutline,
  settingsOutline,
  sunnyOutline,
  timeOutline,
  trendingUpOutline,
} from 'ionicons/icons'

defineCustomElement()

type MenuItem = {
  label: string
  icon: string
  to?: string
}

const menuItems: MenuItem[] = [
  { label: 'Visão geral', icon: gridOutline, to: '/' },
  { label: 'Treinos', icon: barbellOutline },
  { label: 'Históricos', icon: timeOutline },
  { label: 'Evolução', icon: trendingUpOutline },
  { label: 'Alimentação', icon: restaurantOutline },
  { label: 'Metas', icon: flagOutline },
  { label: 'Configurações', icon: settingsOutline },
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
      <p className="flex shrink-0 items-center gap-2.5 px-2.5 pb-7.5 font-heading font-semibold">
        <span
          aria-hidden="true"
          className="grid size-7.25 shrink-0 place-items-center rounded-lg bg-primary text-on-primary"
        >
          C
        </span>
        <span className="text-[1.3125rem] tracking-[-0.04375rem]">consta</span>
      </p>
      <nav aria-label="Principal" className="flex shrink-0 flex-col gap-1.5">
        {menuItems.map(({ label, icon, to }) => {
          const content = (
            <>
              {createElement('ion-icon', {
                icon,
                class: 'size-5 shrink-0',
                'aria-hidden': 'true',
              })}
              <span>{label}</span>
            </>
          )

          return to ? (
            <NavLink
              key={label}
              to={to}
              end
              onClick={onNavigate}
              className={`${menuItemClassName} transition-[background-color,color,opacity] duration-(--duration-fast) ease-standard hover:bg-surface-muted hover:text-foreground active:opacity-80 aria-[current=page]:bg-surface-muted aria-[current=page]:font-semibold aria-[current=page]:text-foreground motion-reduce:transition-none`}
            >
              {content}
            </NavLink>
          ) : (
            <button key={label} type="button" disabled className={`${menuItemClassName} cursor-default`}>
              {content}
            </button>
          )
        })}
      </nav>
      <div className="mt-auto shrink-0 pt-6">
        <div className="border-t border-border pt-3">
          <button
            type="button"
            onClick={onToggleTheme}
            className={`${menuItemClassName} w-full cursor-pointer transition-[background-color,color,opacity] duration-(--duration-fast) ease-standard hover:bg-surface-muted hover:text-foreground active:opacity-80 motion-reduce:transition-none`}
          >
            {createElement('ion-icon', {
              icon: isDarkTheme ? sunnyOutline : moonOutline,
              class: 'size-5 shrink-0',
              'aria-hidden': 'true',
            })}
            <span>{isDarkTheme ? 'Tema claro' : 'Tema escuro'}</span>
          </button>
          <div className="mt-2 flex items-center gap-1.5 rounded-lg px-2 py-2.5">
            <span
              aria-hidden="true"
              className="grid size-8.5 shrink-0 place-items-center rounded-full bg-primary font-semibold text-on-primary"
            >
              M
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate text-sm font-semibold">Marina</span>
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
