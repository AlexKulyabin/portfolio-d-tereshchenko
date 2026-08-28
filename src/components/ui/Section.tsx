import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { useSectionView } from '@/lib/useSectionView'
import type { AnalyticsSection } from '@/lib/metrika'
import { Reveal } from './Reveal'

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mx-auto w-full max-w-6xl px-5 sm:px-8', className)}>{children}</div>
}

type SectionProps = {
  children: ReactNode
  className?: string
  id?: string
  /** Стабильное имя секции для цели section_view в Метрике. */
  analyticsId?: AnalyticsSection
  /** Тёмная секция — светлый текст на синем градиенте */
  tone?: 'light' | 'soft' | 'dark'
}

export function Section({ children, className, id, analyticsId, tone = 'light' }: SectionProps) {
  const analyticsRef = useSectionView(analyticsId)
  const tones = {
    light: 'bg-white text-ink-900',
    soft: 'bg-surface text-ink-900',
    dark: 'bg-hero-gradient text-white',
  }

  return (
    <section
      ref={analyticsRef}
      id={id}
      className={cn('py-20 sm:py-24 lg:py-28', tones[tone], className)}
    >
      {children}
    </section>
  )
}

type SectionHeaderProps = {
  title: string
  subtitle?: string
  align?: 'left' | 'center'
  tone?: 'light' | 'dark'
  eyebrow?: string
}

export function SectionHeader({
  title,
  subtitle,
  align = 'left',
  tone = 'light',
  eyebrow,
}: SectionHeaderProps) {
  return (
    <Reveal>
      <div className={cn('max-w-3xl', align === 'center' && 'mx-auto text-center')}>
        {eyebrow && (
          <p
            className={cn(
              'mb-3 text-sm font-semibold tracking-wide uppercase',
              tone === 'dark' ? 'text-accent-400' : 'text-brand-700',
            )}
          >
            {eyebrow}
          </p>
        )}
        <h2 className={cn('text-3xl sm:text-4xl lg:text-[2.75rem]', tone === 'dark' && 'text-white')}>
          {title}
        </h2>
        {subtitle && (
          <p className={cn('mt-5 text-lg', tone === 'dark' ? 'text-white/70' : 'text-ink-600')}>
            {subtitle}
          </p>
        )}
      </div>
    </Reveal>
  )
}
