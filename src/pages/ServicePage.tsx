import { Link, useParams } from 'react-router-dom'
import { ArrowRight, ChevronRight, Phone } from 'lucide-react'
import { useContent } from '@/lib/ContentProvider'
import { findService } from '@/lib/content'
import { breadcrumbSchema, faqSchema, serviceSchema, webPageSchema } from '@/lib/schema-org'
import { serviceSeoCopy } from '@/lib/service-seo'
import { telHref } from '@/lib/utils'
import { rememberLeadContext, trackGoal } from '@/lib/metrika'
import { Seo } from '@/components/Seo'
import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Section'
import { Pricing } from '@/components/sections/Pricing'
import {
  DeliverablesSection,
  IncludedSection,
  TermsSection,
  WhySection,
} from '@/components/sections/ServiceBlocks'
import { ExpertBlock } from '@/components/sections/ExpertBlock'
import { FaqSection } from '@/components/sections/FaqSection'
import { CtaSection } from '@/components/sections/CtaSection'
import NotFoundPage from './NotFoundPage'

export default function ServicePage() {
  const { slug } = useParams<{ slug: string }>()
  const content = useContent()
  const service = slug ? findService(content, slug) : undefined

  if (!service) return <NotFoundPage />

  const { contacts } = content.settings
  const phoneLink = telHref(contacts.phoneRaw, contacts.phone)

  const schemas = [
    serviceSchema(content, service),
    webPageSchema(content, `/${service.slug}`, service.seo.title, service.seo.description),
    faqSchema(service.faq),
    breadcrumbSchema(content.settings.siteUrl, [
      { name: 'Главная', path: '/' },
      { name: service.title, path: `/${service.slug}` },
    ]),
  ].filter((schema): schema is Record<string, unknown> => schema !== null)

  return (
    <>
      <Seo
        title={service.seo.title}
        description={service.seo.description}
        path={`/${service.slug}`}
        ogImage={service.seo.ogImage}
        jsonLd={schemas}
      />

      <div className="relative overflow-hidden bg-hero-gradient text-white">
        <div aria-hidden="true" className="absolute inset-0 bg-grid-overlay" />
        <Container className="relative">
          <nav aria-label="Хлебные крошки" className="pt-8">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-white/50">
              <li>
                <Link to="/" className="transition-colors hover:text-white">
                  Главная
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="size-4" />
              </li>
              <li className="text-white/80">{service.shortTitle}</li>
            </ol>
          </nav>

          <div className="py-16 sm:py-20 lg:py-24">
            <div className="max-w-3xl">
              <h1 className="text-4xl leading-[1.1] text-white sm:text-5xl">
                {service.hero.title || service.title}
              </h1>
              {service.hero.subtitle && (
                <p className="mt-6 max-w-2xl text-lg text-white/75">{service.hero.subtitle}</p>
              )}

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <ButtonLink
                  to="#zayavka"
                  size="lg"
                  variant="light"
                  onClick={() => {
                    rememberLeadContext(service.slug, 'hero_service')
                    trackGoal('cta_click', {
                      service: service.slug,
                      placement: 'hero_service',
                    })
                  }}
                >
                  Получить расчёт
                  <ArrowRight aria-hidden="true" className="size-5" />
                </ButtonLink>
                {phoneLink && (
                  <ButtonLink
                    to={phoneLink}
                    size="lg"
                    variant="ghost"
                    onClick={() => trackGoal('click_phone', { placement: 'hero_service' })}
                  >
                    <Phone aria-hidden="true" className="size-5" />
                    {contacts.phone}
                  </ButtonLink>
                )}
              </div>

              <dl className="mt-12 grid gap-6 border-t border-white/10 pt-8 sm:grid-cols-3">
                <div>
                  <dt className="text-sm text-white/50">Срок разработки</dt>
                  <dd className="mt-1 font-display text-lg font-bold text-white">
                    {service.terms.development}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-white/50">Выезд по России</dt>
                  <dd className="mt-1 font-display text-lg font-bold text-white">
                    {service.terms.visit}
                  </dd>
                </div>
                {service.priceFrom && (
                  <div>
                    <dt className="text-sm text-white/50">Стоимость</dt>
                    <dd className="mt-1 font-display text-lg font-bold text-white">
                      от {service.priceFrom}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </Container>
      </div>

      <WhySection service={service} />
      <IncludedSection service={service} />
      <DeliverablesSection service={service} />
      <Pricing service={service} />
      <TermsSection service={service} />
      <ExpertBlock compact />
      <FaqSection items={service.faq} title={serviceSeoCopy[service.slug].faqTitle} tone="soft" />
      <CtaSection defaultService={service.title} />
    </>
  )
}
