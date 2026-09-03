import { Link } from 'react-router-dom'
import { useContent } from '@/lib/ContentProvider'
import { cn } from '@/lib/utils'

/**
 * Знак в шапке: favicon создана из предоставленного логотипа.
 * Один и тот же знак используется и в браузере, и рядом с названием сайта.
 */
export function Logo({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const { expert } = useContent()

  return (
    <Link to="/" className="group flex items-center gap-3" aria-label="На главную">
      <span
        aria-hidden="true"
        className="flex size-11 shrink-0 overflow-hidden rounded-xl bg-white shadow-[0_6px_18px_-8px_rgba(29,78,216,0.45)] ring-1 ring-navy-900/10"
      >
        <img
          src="/header-logo.png"
          alt=""
          width={120}
          height={120}
          decoding="async"
          className="size-full object-cover"
        />
      </span>
      <span className="flex flex-col leading-tight">
        <span
          className={cn(
            'font-display text-base font-bold tracking-tight whitespace-nowrap',
            tone === 'dark' ? 'text-white' : 'text-navy-900',
          )}
        >
          {expert.name}
        </span>
        {/* Подпись занимает место, которое на средних экранах нужнее меню */}
        <span
          className={cn(
            'hidden text-xs whitespace-nowrap xl:block',
            tone === 'dark' ? 'text-white/60' : 'text-ink-600',
          )}
        >
          Охрана труда · Нормирование · ХАССП
        </span>
      </span>
    </Link>
  )
}
