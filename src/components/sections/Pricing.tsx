import { Check } from 'lucide-react'
import type { ServicePackage } from '@/schemas/content'
import { cn } from '@/lib/utils'
import { ButtonLink } from '@/components/ui/Button'
import { Container, Section, SectionHeader } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'

/**
 * Три пакета услуги — требование технического задания.
 *
 * Пока цена не заполнена в админке, вместо суммы показывается «по запросу»:
 * так блок не выглядит сломанным на этапе, когда цены ещё не согласованы.
 */
export function Pricing({ packages }: { packages: ServicePackage[] }) {
  if (packages.length === 0) return null

  return (
    <Section id="stoimost" tone="soft">
      <Container>
        <SectionHeader
          eyebrow="Стоимость"
          title="Три пакета на выбор"
          subtitle="Выберите подходящий вариант или обсудим индивидуальные условия под вашу задачу."
          align="center"
        />

        <ul
          className={cn(
            'mx-auto mt-14 grid gap-6',
            packages.length === 3 ? 'lg:grid-cols-3' : 'sm:grid-cols-2',
          )}
        >
          {packages.map((pkg, index) => (
            <Reveal key={pkg.name} as="li" delay={index * 70} className="h-full">
              <div
                className={cn(
                  'relative flex h-full flex-col rounded-2xl p-7 transition-shadow',
                  pkg.highlighted
                    ? 'bg-hero-gradient text-white shadow-[0_24px_60px_-24px_rgba(11,37,69,0.6)] ring-1 ring-navy-900'
                    : 'bg-white ring-1 ring-line',
                )}
              >
                {pkg.highlighted && (
                  <span className="absolute -top-3 left-7 rounded-full bg-accent-400 px-3 py-1 text-xs font-semibold text-navy-950">
                    Рекомендую
                  </span>
                )}

                <h3
                  className={cn(
                    'font-display text-xl font-bold',
                    pkg.highlighted ? 'text-white' : 'text-navy-900',
                  )}
                >
                  {pkg.name}
                </h3>

                {pkg.description && (
                  <p className={cn('mt-2 text-sm', pkg.highlighted ? 'text-white/70' : 'text-ink-600')}>
                    {pkg.description}
                  </p>
                )}

                <div className="mt-6">
                  <span
                    className={cn(
                      'font-display text-3xl font-bold',
                      pkg.highlighted ? 'text-white' : 'text-navy-900',
                    )}
                  >
                    {pkg.price || 'По запросу'}
                  </span>
                  {pkg.priceNote && (
                    <span
                      className={cn(
                        'mt-1 block text-sm',
                        pkg.highlighted ? 'text-white/60' : 'text-ink-400',
                      )}
                    >
                      {pkg.priceNote}
                    </span>
                  )}
                </div>

                {pkg.duration && (
                  <p
                    className={cn(
                      'mt-4 inline-flex w-fit rounded-lg px-3 py-1.5 text-sm font-medium',
                      pkg.highlighted
                        ? 'bg-white/10 text-accent-300 ring-1 ring-white/15'
                        : 'bg-brand-50 text-brand-700',
                    )}
                  >
                    Срок: {pkg.duration}
                  </p>
                )}

                {pkg.features.length > 0 && (
                  <ul
                    className={cn(
                      'mt-6 flex-1 space-y-3 border-t pt-6 text-[0.95rem]',
                      pkg.highlighted ? 'border-white/15 text-white/80' : 'border-line text-ink-600',
                    )}
                  >
                    {pkg.features.map((feature) => (
                      <li key={feature} className="flex gap-3">
                        <Check
                          aria-hidden="true"
                          className={cn(
                            'mt-0.5 size-5 shrink-0',
                            pkg.highlighted ? 'text-accent-400' : 'text-brand-600',
                          )}
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <ButtonLink
                  to="#zayavka"
                  variant={pkg.highlighted ? 'light' : 'secondary'}
                  className="mt-7 w-full"
                >
                  Выбрать пакет
                </ButtonLink>
              </div>
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  )
}
