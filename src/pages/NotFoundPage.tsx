import { useContent } from '@/lib/ContentProvider'
import { sortedServices } from '@/lib/content'
import { Seo } from '@/components/Seo'
import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Section'
import { Link } from 'react-router-dom'
import { trackGoal } from '@/lib/metrika'

export default function NotFoundPage() {
  const content = useContent()
  const services = sortedServices(content)

  return (
    <>
      <Seo
        title="Страница не найдена"
        description="Запрошенная страница не существует."
        path="/404"
        noindex
      />

      <div className="flex min-h-[70vh] items-center bg-hero-gradient py-20 text-white">
        <Container>
          <p className="font-display text-7xl font-bold text-accent-400">404</p>
          <h1 className="mt-6 text-3xl sm:text-4xl">Такой страницы нет</h1>
          <p className="mt-4 max-w-xl text-white/70">
            Возможно, адрес изменился или в ссылке опечатка. Вернитесь на главную или выберите
            услугу из списка.
          </p>

          <div className="mt-9">
            <ButtonLink to="/" size="lg" variant="light">
              На главную
            </ButtonLink>
          </div>

          <ul className="mt-12 flex flex-wrap gap-3 border-t border-white/10 pt-8">
            {services.map((service) => (
              <li key={service.slug}>
                <Link
                  to={`/${service.slug}`}
                  onClick={() =>
                    trackGoal('service_open', {
                      service: service.slug,
                      placement: 'not_found',
                    })
                  }
                  className="inline-flex rounded-xl bg-white/5 px-5 py-3 text-[0.95rem] text-white/80 ring-1 ring-white/10 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {service.shortTitle}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </div>
    </>
  )
}
