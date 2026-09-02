import { useContent } from '@/lib/ContentProvider'
import { Container, Section, SectionHeader } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'

export function Steps() {
  const { home } = useContent()
  const { steps } = home

  if (steps.items.length === 0) return null

  return (
    <Section id="etapy-raboty" analyticsId="steps" tone="light">
      <Container>
        <SectionHeader
          eyebrow="Процесс"
          title={steps.title || 'Как проходит работа'}
          subtitle={steps.subtitle}
        />

        <ol className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.items.map((step, index) => (
            <Reveal key={step.title} as="li" delay={index * 70} className="h-full">
              <div className="relative flex h-full flex-col rounded-2xl bg-surface p-7">
                <span
                  aria-hidden="true"
                  className="font-display text-5xl font-bold text-brand-200 tabular-nums"
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-navy-900">{step.title}</h3>
                <p className="mt-3 flex-1 text-[0.975rem] leading-relaxed text-ink-600">
                  {step.text}
                </p>
                {step.duration && (
                  <p className="mt-5 inline-flex w-fit rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-brand-700 ring-1 ring-brand-100">
                    {step.duration}
                  </p>
                )}
              </div>
            </Reveal>
          ))}
        </ol>
      </Container>
    </Section>
  )
}
