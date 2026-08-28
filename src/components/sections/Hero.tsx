import { ArrowRight, Phone } from 'lucide-react'
import { useContent } from '@/lib/ContentProvider'
import { telHref } from '@/lib/utils'
import { rememberLeadContext, trackGoal } from '@/lib/metrika'
import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Section'

/**
 * Первый экран главной страницы.
 *
 * Анимации появления здесь нет намеренно: это LCP-элемент, и он должен
 * быть виден сразу, без ожидания скриптов.
 */
export function Hero() {
  const content = useContent()
  const { hero } = content.home
  const { contacts } = content.settings
  const phoneLink = telHref(contacts.phoneRaw, contacts.phone)

  return (
    <div className="relative overflow-hidden bg-hero-gradient text-white">
      <div aria-hidden="true" className="absolute inset-0 bg-grid-overlay" />

      <Container className="relative">
        <div className="py-20 sm:py-28 lg:py-36">
          <div className="max-w-3xl">
            {hero.badge && (
              <p className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-accent-300 ring-1 ring-white/15 backdrop-blur-sm">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-accent-400" />
                {hero.badge}
              </p>
            )}

            <h1 className="text-4xl leading-[1.08] text-white sm:text-5xl lg:text-6xl">
              {hero.title}
            </h1>

            {hero.subtitle && (
              <p className="mt-7 max-w-2xl text-lg text-white/75 sm:text-xl">{hero.subtitle}</p>
            )}

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <ButtonLink
                to="/#zayavka"
                size="lg"
                variant="light"
                onClick={() => {
                  rememberLeadContext('general', 'hero_home')
                  trackGoal('cta_click', { service: 'general', placement: 'hero_home' })
                }}
              >
                {hero.ctaPrimary || 'Получить расчёт'}
                <ArrowRight aria-hidden="true" className="size-5" />
              </ButtonLink>
              {phoneLink && (
                <ButtonLink
                  to={phoneLink}
                  size="lg"
                  variant="ghost"
                  onClick={() => trackGoal('click_phone', { placement: 'hero_home' })}
                >
                  <Phone aria-hidden="true" className="size-5" />
                  {contacts.phone || hero.ctaSecondary}
                </ButtonLink>
              )}
            </div>
          </div>

          {hero.stats.length > 0 && (
            <dl className="mt-16 grid gap-6 border-t border-white/10 pt-10 sm:grid-cols-3 lg:mt-20">
              {hero.stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd>
                    <span className="block font-display text-3xl font-bold text-white sm:text-4xl">
                      {stat.value}
                    </span>
                    <span className="mt-1 block text-sm text-white/60">{stat.label}</span>
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </Container>
    </div>
  )
}
