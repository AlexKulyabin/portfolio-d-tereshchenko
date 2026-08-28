import { useContent } from '@/lib/ContentProvider'
import { getIcon } from '@/lib/icons'
import { Container, Section, SectionHeader } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'

export function Advantages() {
  const { home } = useContent()
  const { advantages } = home

  if (advantages.items.length === 0) return null

  return (
    <Section analyticsId="advantages" tone="soft">
      <Container>
        <SectionHeader
          eyebrow="Подход к работе"
          title={advantages.title || 'Почему обращаются ко мне'}
          subtitle={advantages.subtitle}
        />

        <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {advantages.items.map((item, index) => {
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
