import { createElement } from 'react'
import { NavLink } from 'react-router'
import { defineCustomElement } from 'ionicons/components/ion-icon.js'
import {
  barbellOutline,
  flagOutline,
  gridOutline,
  restaurantOutline,
  settingsOutline,
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
  onNavigate?: () => void
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  return (
    <>
      <p className="flex items-center gap-2.5 px-2.5 pb-7.5 font-heading font-semibold">
        <span
          aria-hidden="true"
          className="grid size-7.25 shrink-0 place-items-center rounded-lg bg-primary text-on-primary"
        >
          C
        </span>
        <span className="text-[1.3125rem] tracking-[-0.04375rem]">consta</span>
      </p>
      <nav aria-label="Principal" className="flex flex-col gap-1.5">
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
    </>
  )
}
