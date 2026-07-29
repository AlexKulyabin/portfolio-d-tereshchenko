import { User } from 'lucide-react'
import { useContent } from '@/lib/ContentProvider'
import { Container, Section } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'

/**
 * Блок об эксперте.
 *
 * Присутствует и на главной, и на каждой странице услуги — по требованию
 * технического задания. Вариант compact используется на страницах услуг,
 * чтобы не перегружать их повтором.
 */
export function ExpertBlock({ compact = false }: { compact?: boolean }) {
  const { expert } = useContent()

  return (
    <Section tone={compact ? 'light' : 'soft'} id="ob-ekspert">
      <Container>
        <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <div className="relative">
              {expert.photo.url ? (
                <img
                  src={expert.photo.url}
                  alt={expert.photo.alt || `${expert.name} — ${expert.role}`}
                  width={expert.photo.width}
                  height={expert.photo.height}
                  loading="lazy"
                  decoding="async"
                  className="aspect-4/5 w-full rounded-2xl object-cover shadow-[var(--shadow-card)]"
                />
              ) : (
                <div className="flex aspect-4/5 w-full items-center justify-center rounded-2xl bg-linear-to-br from-navy-900 to-brand-700 text-white/30">
                  <User aria-hidden="true" className="size-24" strokeWidth={1} />
                </div>
              )}
            </div>
          </Reveal>

          <Reveal delay={80} className="lg:col-span-7">
            <p className="mb-3 text-sm font-semibold tracking-wide text-brand-700 uppercase">
              Об эксперте
            </p>
            <h2 className="text-3xl sm:text-4xl">{expert.name}</h2>
            <p className="mt-3 text-lg font-medium text-brand-700">{expert.role}</p>

            {expert.bio && (
              <div className="mt-6 space-y-4 text-ink-600">
                {expert.bio.split('\n').filter(Boolean).map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            )}

            {expert.stats.length > 0 && (
              <dl className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
                {expert.stats.map((stat) => (
                  <div key={stat.label} className="border-l-2 border-brand-600 pl-4">
                    <dt className="sr-only">{stat.label}</dt>
                    <dd>
                      <span className="block font-display text-2xl font-bold text-navy-900">
                        {stat.value}
                      </span>
                      <span className="mt-1 block text-sm text-ink-600">{stat.label}</span>
                    </dd>
                  </div>
                ))}
              </dl>
            )}

            {!compact && expert.credentials.length > 0 && (
              <div className="mt-12">
                <h3 className="font-display text-lg font-semibold text-navy-900">
                  Образование и документы
                </h3>
                <ul className="mt-5 grid gap-4 sm:grid-cols-2">
                  {expert.credentials.map((credential, index) => (
                    <li key={index} className="rounded-xl bg-white p-5 ring-1 ring-line">
                      {credential.image.url && (
                        <img
                          src={credential.image.url}
                          alt={credential.image.alt || credential.title}
                          loading="lazy"
                          decoding="async"
                          className="mb-4 aspect-3/4 w-full rounded-lg object-cover"
                        />
                      )}
                      <p className="font-medium text-navy-900">{credential.title}</p>
                      {credential.issuer && (
                        <p className="mt-1 text-sm text-ink-600">{credential.issuer}</p>
                      )}
                      {credential.year && (
                        <p className="mt-1 text-sm text-ink-400">{credential.year}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Reveal>
        </div>
      </Container>
    </Section>
  )
}
