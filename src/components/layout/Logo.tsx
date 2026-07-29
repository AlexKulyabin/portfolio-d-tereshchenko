import { Link } from 'react-router-dom'
import { useContent } from '@/lib/ContentProvider'
import { cn } from '@/lib/utils'

/**
 * Текстовый знак: инициалы в синем квадрате плюс подпись.
 * Пока у заказчика нет логотипа — это аккуратный нейтральный вариант,
 * который не выглядит как заглушка.
 */
export function Logo({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const { expert } = useContent()

  const initials =
    expert.name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'ДТ'

  return (
    <Link to="/" className="group flex items-center gap-3" aria-label="На главную">
      <span
        aria-hidden="true"
        className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-brand-600 to-navy-900 font-display text-base font-bold text-white shadow-[0_6px_18px_-8px_rgba(29,78,216,0.8)]"
      >
        {initials}
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
