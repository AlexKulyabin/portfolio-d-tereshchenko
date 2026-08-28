import { Quote } from 'lucide-react'
import { useContent } from '@/lib/ContentProvider'
import { Container, Section, SectionHeader } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'

export function Testimonials() {
  const { home } = useContent()
  const { testimonials } = home
  const verifiedItems = testimonials.items.filter((item) => item.verified)

  // Пустой блок отзывов выглядит хуже, чем публикация неподтверждённого отзыва.
  if (verifiedItems.length === 0) return null

  return (
    <Section analyticsId="testimonials" tone="soft">
      <Container>
        <SectionHeader eyebrow="Отзывы" title={testimonials.title || 'Что говорят клиенты'} />

        <ul className="mt-14 grid gap-6 lg:grid-cols-2">
          {verifiedItems.map((item, index) => (
            <Reveal key={index} as="li" delay={(index % 2) * 70} className="h-full">
              <figure className="flex h-full flex-col rounded-2xl bg-white p-7 ring-1 ring-line">
                <Quote aria-hidden="true" className="size-8 text-brand-200" />
                <blockquote className="mt-4 flex-1 text-ink-700">{item.text}</blockquote>
                <figcaption className="mt-6 border-t border-line pt-5">
                  <span className="block font-medium text-navy-900">{item.author}</span>
                  {(item.position || item.company) && (
                    <span className="mt-1 block text-sm text-ink-600">
                      {[item.position, item.company].filter(Boolean).join(', ')}
                    </span>
                  )}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  )
}
