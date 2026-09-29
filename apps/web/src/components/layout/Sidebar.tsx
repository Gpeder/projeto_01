import { NavLink } from 'react-router'

type SidebarProps = {
  onNavigate?: () => void
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  return (
    <>
      <p className="flex items-center gap-2.5 px-2.5 pb-[1.875rem] font-heading font-semibold">
        <span
          aria-hidden="true"
          className="grid size-[1.8125rem] shrink-0 place-items-center rounded-lg bg-primary text-on-primary"
        >
          C
        </span>
        <span className="text-[1.3125rem] tracking-[-0.04375rem]">consta</span>
      </p>
      <nav aria-label="Principal">
        <NavLink
          to="/"
          end
          onClick={onNavigate}
          className="flex min-h-11 items-center gap-[0.8125rem] rounded-lg px-3 py-2 text-sm font-medium text-muted transition-[background-color,color,opacity] duration-(--duration-fast) ease-standard hover:bg-surface-muted hover:text-foreground active:opacity-80 aria-[current=page]:bg-surface-muted aria-[current=page]:font-semibold aria-[current=page]:text-foreground motion-reduce:transition-none"
        >
          <svg
            aria-hidden="true"
            className="size-5 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m3 10 9-7 9 7M5 9v11h5v-6h4v6h5V9" />
          </svg>
          <span>Visão geral</span>
        </NavLink>
      </nav>
    </>
  )
}
