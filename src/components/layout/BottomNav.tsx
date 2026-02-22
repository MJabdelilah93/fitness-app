import { NavLink } from 'react-router-dom'
import {
  Home,
  Dumbbell,
  TrendingUp,
  BarChart2,
  Settings,
} from 'lucide-react'
import { cn } from '../../utils/cn'

const TABS = [
  { to: '/',           icon: Home,       label: 'Today'    },
  { to: '/workout',    icon: Dumbbell,   label: 'Workout'  },
  { to: '/metrics',   icon: TrendingUp,  label: 'Metrics'  },
  { to: '/dashboard', icon: BarChart2,   label: 'Progress' },
  { to: '/settings',  icon: Settings,    label: 'Settings' },
] as const

export function BottomNav() {
  return (
    /* Safe-area padding for phones with a home indicator (iPhone-style) */
    <nav
      className="fixed bottom-0 inset-x-0 z-20 bg-surface-900 border-t border-surface-700"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex">
        {TABS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors duration-150',
                isActive
                  ? 'text-accent-500'
                  : 'text-surface-600 active:text-zinc-400',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 2}
                  className="shrink-0"
                />
                <span
                  className={cn(
                    'text-[10px] leading-none',
                    isActive ? 'font-semibold' : 'font-normal',
                  )}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
