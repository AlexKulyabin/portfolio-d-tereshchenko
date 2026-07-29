import { AlertTriangle, CalendarClock, Check, FileCheck2, MapPin, Scale } from 'lucide-react'
import type { Service } from '@/schemas/content'
import { getIcon } from '@/lib/icons'
import { Container, Section, SectionHeader } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'

/** Зачем нужна услуга: требование закона и цена бездействия. */
export function WhySection({ service }: { service: Service }) {
  const { why } = service
  if (!why.body && why.legalRefs.length === 0) return null

  return (
    <Section tone="light">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <SectionHeader eyebrow="Требование закона" title={why.title || 'Зачем это нужно'} />
            {why.body && (
              <Reveal>
                <div className="mt-6 space-y-4 text-ink-600">
                  {why.body.split('\n').filter(Boolean).map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </Reveal>
            )}

            {why.penalty && (
              <Reveal delay={80}>
                <div className="mt-8 flex gap-4 rounded-2xl bg-amber-50 p-6 ring-1 ring-amber-200">
                  <AlertTriangle aria-hidden="true" className="size-6 shrink-0 text-amber-600" />
                  <div>
                    <h3 className="font-display font-bold text-navy-900">Ответственность</h3>
                    <p className="mt-2 text-[0.975rem] leading-relaxed text-ink-700">
                      {why.penalty}
                    </p>
                  </div>
                </div>
              </Reveal>
            )}
          </div>

          {why.legalRefs.length > 0 && (
            <Reveal delay={120} className="lg:col-span-5">
              <div className="rounded-2xl bg-surface p-7">
                <h3 className="flex items-center gap-3 font-display text-lg font-bold text-navy-900">
                  <Scale aria-hidden="true" className="size-5 text-brand-700" />
                  Нормативная база
                </h3>
                <ul className="mt-5 space-y-4">
                  {why.legalRefs.map((ref, index) => (
                    <li
                      key={index}
                      className="border-l-2 border-brand-200 pl-4 text-[0.925rem] leading-relaxed text-ink-600"
                    >
                      {ref}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          )}
        </div>
      </Container>
    </Section>
  )
}

/** Что входит в работу. */
export function IncludedSection({ service }: { service: Service }) {
  if (service.included.length === 0) return null

  return (
    <Section tone="soft">
      <Container>
        <SectionHeader
          eyebrow="Состав работ"
          title="Что входит в услугу"
          subtitle="Полный цикл: от обследования до готовых документов и объяснения, как ими пользоваться."
        />

        <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {service.included.map((item, index) => {
            const Icon = getIcon(item.icon)
            return (
              <Reveal key={item.title} as="li" delay={(index % 3) * 70} className="h-full">
                <div className="flex h-full flex-col rounded-2xl bg-white p-7 ring-1 ring-line">
                  <span
                    aria-hidden="true"
                    className="flex size-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700"
                  >
                    <Icon className="size-6" />
                  </span>
                  <h3 className="mt-5 font-display text-lg font-bold text-navy-900">{item.title}</h3>
                  <p className="mt-3 text-[0.975rem] leading-relaxed text-ink-600">{item.text}</p>
                </div>
              </Reveal>
            )
          })}
        </ul>
      </Container>
    </Section>
  )
}

/** Что клиент получает на руки — самый убедительный блок на странице. */
export function DeliverablesSection({ service }: { service: Service }) {
  if (service.deliverables.length === 0) return null

  return (
    <Section tone="light">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHeader
              eyebrow="Результат"
              title="Что вы получите"
              subtitle="Готовый комплект документов, оформленный под ваше предприятие."
            />
            <Reveal delay={80}>
              <div className="mt-8 flex items-center gap-4 rounded-2xl bg-brand-50 p-6">
                <FileCheck2 aria-hidden="true" className="size-8 shrink-0 text-brand-700" />
                <p className="text-[0.975rem] text-ink-700">
                  Документы передаются в электронном виде, по согласованию — в печатном, прошитые
                  и готовые к утверждению.
                </p>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <Reveal delay={120}>
              <ul className="grid gap-3">
                {service.deliverables.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-4 rounded-xl bg-surface px-5 py-4 text-[0.975rem] text-ink-700"
                  >
                    <Check aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-brand-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </Container>
    </Section>
  )
}

/**
 * Сроки: разработка от 3 календарных дней и выезд по России от 1 дня.
 * Оба значения прямо требуются техническим заданием и редактируются в админке.
 */
export function TermsSection({ service }: { service: Service }) {
  const { terms } = service

  return (
    <Section tone="dark" className="relative overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 bg-grid-overlay opacity-40" />
      <Container className="relative">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHeader eyebrow="Сроки" tone="dark" title="Когда будет готово" />
            {terms.note && <p className="mt-5 text-white/60">{terms.note}</p>}
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:col-span-7">
            <Reveal>
              <div className="rounded-2xl bg-white/5 p-7 ring-1 ring-white/10">
                <CalendarClock aria-hidden="true" className="size-8 text-accent-400" />
                <p className="mt-5 font-display text-2xl font-bold text-white">
                  {terms.development || 'от 3 календарных дней'}
                </p>
                <p className="mt-2 text-white/60">разработка документов</p>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <div className="rounded-2xl bg-white/5 p-7 ring-1 ring-white/10">
                <MapPin aria-hidden="true" className="size-8 text-accent-400" />
                <p className="mt-5 font-display text-2xl font-bold text-white">
                  {terms.visit || 'от 1 календарного дня'}
                </p>
                <p className="mt-2 text-white/60">выезд по России под заказ</p>
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </Section>
  )
}
