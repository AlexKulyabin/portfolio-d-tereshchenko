import { useContent } from '@/lib/ContentProvider'
import { Container, Section, SectionHeader } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'

export function Industries() {
  const { home } = useContent()
  const { industries } = home

  if (industries.items.length === 0) return null

  return (
    <Section
      id="otrasli"
      analyticsId="industries"
      tone="dark"
      className="relative overflow-hidden"
    >
      <div aria-hidden="true" className="absolute inset-0 bg-grid-overlay opacity-50" />
      <Container className="relative">
        <SectionHeader
          eyebrow="Отрасли"
          tone="dark"
          title={industries.title || 'С кем работаю'}
          subtitle={industries.subtitle}
        />

        <ul className="mt-12 flex flex-wrap gap-3">
          {industries.items.map((item, index) => (
            <Reveal key={item} as="li" delay={Math.min(index * 40, 400)}>
              <span className="inline-flex rounded-xl bg-white/5 px-5 py-3 text-[0.95rem] text-white/80 ring-1 ring-white/10 transition-colors hover:bg-white/10 hover:text-white">
                {item}
              </span>
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  )
}
