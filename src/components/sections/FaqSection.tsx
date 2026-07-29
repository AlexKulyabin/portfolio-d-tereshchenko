import type { FaqItem } from '@/schemas/content'
import { Container, Section, SectionHeader } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'
import { Faq } from '@/components/ui/Accordion'

export function FaqSection({
  items,
  title = 'Частые вопросы',
  tone = 'light',
}: {
  items: FaqItem[]
  title?: string
  tone?: 'light' | 'soft'
}) {
  if (items.length === 0) return null

  return (
    <Section tone={tone}>
      <Container>
        <SectionHeader eyebrow="Вопросы и ответы" title={title} align="center" />
        <div className="mx-auto mt-12 max-w-3xl">
          <Reveal>
            <Faq items={items} />
          </Reveal>
        </div>
      </Container>
    </Section>
  )
}
