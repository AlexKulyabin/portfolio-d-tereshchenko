import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { useContent } from '@/lib/ContentProvider'
import { sortedServices } from '@/lib/content'
import { getIcon } from '@/lib/icons'
import { Container, Section, SectionHeader } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'

export function ServicesGrid() {
  const content = useContent()
  const services = sortedServices(content)
  const { servicesIntro } = content.home

  return (
    <Section id="uslugi" tone="light">
      <Container>
        <SectionHeader
          eyebrow="Услуги"
          title={servicesIntro.title || 'Три направления работы'}
          subtitle={servicesIntro.subtitle}
        />

        <ul className="mt-14 grid gap-6 lg:grid-cols-3">
          {services.map((service, index) => {
            const Icon = getIcon(service.icon)
            return (
              <Reveal key={service.slug} as="li" delay={index * 70} className="h-full">
                <Link
                  to={`/${service.slug}`}
                  className="group flex h-full flex-col rounded-2xl bg-white p-7 ring-1 ring-line transition-all duration-300 hover:-translate-y-1 hover:ring-brand-300 hover:shadow-[var(--shadow-card-hover)]"
                >
                  <span
                    aria-hidden="true"
                    className="flex size-13 items-center justify-center rounded-xl bg-linear-to-br from-brand-50 to-brand-100 text-brand-700 transition-colors group-hover:from-brand-600 group-hover:to-navy-900 group-hover:text-white"
                  >
                    <Icon className="size-6" />
                  </span>

                  <h3 className="mt-6 font-display text-xl font-bold text-navy-900">
                    {service.title}
                  </h3>
                  <p className="mt-3 flex-1 text-[0.975rem] leading-relaxed text-ink-600">
                    {service.summary}
                  </p>

                  <span className="mt-6 flex items-center justify-between border-t border-line pt-5">
                    {service.priceFrom ? (
                      <span className="font-display font-semibold text-navy-900">
                        от {service.priceFrom}
                      </span>
                    ) : (
                      <span className="text-sm text-ink-400">
                        {service.terms.development || 'от 3 календарных дней'}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 text-sm font-medium text-brand-700">
                      Подробнее
                      <ArrowUpRight
                        aria-hidden="true"
                        className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </span>
                  </span>
                </Link>
              </Reveal>
            )
          })}
        </ul>
      </Container>
    </Section>
  )
}
