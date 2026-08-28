import { Link } from 'react-router-dom'
import { Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react'
import { useContent } from '@/lib/ContentProvider'
import { useAnalyticsConsent } from '@/lib/AnalyticsConsentProvider'
import { sortedServices } from '@/lib/content'
import { messengerHref, telHref } from '@/lib/utils'
import { trackGoal } from '@/lib/metrika'
import { Container } from '@/components/ui/Section'
import { Logo } from './Logo'

export function Footer() {
  const content = useContent()
  const { openPreferences } = useAnalyticsConsent()
  const services = sortedServices(content)
  const { contacts, legal } = content.settings
  const phoneLink = telHref(contacts.phoneRaw, contacts.phone)
  const year = new Date().getFullYear()

  return (
    <footer className="bg-navy-950 text-white/70">
      <Container>
        <div className="grid gap-12 py-16 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Logo tone="dark" />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/60">
              Разработка документов по охране труда, нормированию труда и системам ХАССП.
              {contacts.geography ? ` ${contacts.geography}.` : ' Работаем по всей России.'}
            </p>
          </div>

          {/* Дублирование услуг в подвале — требование технического задания */}
          <nav aria-label="Услуги" className="lg:col-span-3">
            <h2 className="font-display text-sm font-semibold tracking-wide text-white uppercase">
              Услуги
            </h2>
            <ul className="mt-5 space-y-3 text-sm">
              {services.map((service) => (
                <li key={service.slug}>
                  <Link
                    to={`/${service.slug}`}
                    onClick={() =>
                      trackGoal('service_open', {
                        service: service.slug,
                        placement: 'footer',
                      })
                    }
                    className="transition-colors hover:text-accent-400"
                  >
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Разделы" className="lg:col-span-2">
            <h2 className="font-display text-sm font-semibold tracking-wide text-white uppercase">
              Сайт
            </h2>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <Link to="/" className="transition-colors hover:text-accent-400">
                  Главная
                </Link>
              </li>
              <li>
                <Link to="/kontakty" className="transition-colors hover:text-accent-400">
                  Контакты
                </Link>
              </li>
              <li>
                <Link
                  to="/politika-konfidencialnosti"
                  className="transition-colors hover:text-accent-400"
                >
                  Политика конфиденциальности
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={openPreferences}
                  className="text-left transition-colors hover:text-accent-400"
                >
                  Настройки cookies
                </button>
              </li>
              <li>
                <Link
                  to="/soglasie-na-obrabotku-dannyh"
                  className="transition-colors hover:text-accent-400"
                >
                  Согласие на обработку данных
                </Link>
              </li>
            </ul>
          </nav>

          {/* Контакты внизу сайта — второе требование технического задания */}
          <div className="lg:col-span-3">
            <h2 className="font-display text-sm font-semibold tracking-wide text-white uppercase">
              Контакты
            </h2>
            <ul className="mt-5 space-y-4 text-sm">
              {phoneLink && (
                <li>
                  <a
                    href={phoneLink}
                    onClick={() => trackGoal('click_phone', { placement: 'footer' })}
                    className="flex items-center gap-3 text-base font-medium text-white transition-colors hover:text-accent-400"
                  >
                    <Phone aria-hidden="true" className="size-4 shrink-0 text-accent-400" />
                    {contacts.phone}
                  </a>
                </li>
              )}
              {contacts.email && (
                <li>
                  <a
                    href={`mailto:${contacts.email}`}
                    onClick={() => trackGoal('click_email', { placement: 'footer' })}
                    className="flex items-center gap-3 transition-colors hover:text-accent-400"
                  >
                    <Mail aria-hidden="true" className="size-4 shrink-0 text-accent-400" />
                    {contacts.email}
                  </a>
                </li>
              )}
              {contacts.telegram && (
                <li>
                  <a
                    href={messengerHref(contacts.telegram, 'telegram')}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackGoal('click_telegram', { placement: 'footer' })}
                    className="flex items-center gap-3 transition-colors hover:text-accent-400"
                  >
                    <Send aria-hidden="true" className="size-4 shrink-0 text-accent-400" />
                    Telegram
                  </a>
                </li>
              )}
              {contacts.whatsapp && (
                <li>
                  <a
                    href={messengerHref(contacts.whatsapp, 'whatsapp')}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackGoal('click_whatsapp', { placement: 'footer' })}
                    className="flex items-center gap-3 transition-colors hover:text-accent-400"
                  >
                    <MessageCircle aria-hidden="true" className="size-4 shrink-0 text-accent-400" />
                    WhatsApp*
                  </a>
                </li>
              )}
              {contacts.city && (
                <li className="flex items-center gap-3">
                  <MapPin aria-hidden="true" className="size-4 shrink-0 text-accent-400" />
                  {contacts.city}
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 py-8 text-xs text-white/50">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {year} {legal.name || content.expert.name}
              {legal.inn && ` · ИНН ${legal.inn}`}
              {legal.ogrn && ` · ОГРН${legal.entityType === 'ip' ? 'ИП' : ''} ${legal.ogrn}`}
            </p>
            <p>
              Информация на сайте не является публичной офертой. Цены уточняйте по телефону.
            </p>
          </div>
          {contacts.whatsapp && (
            <p className="mt-5 max-w-2xl border-l border-accent-400/50 pl-3 text-[11px] leading-relaxed text-white/40">
              * Принадлежит компании Meta* (признана экстремистской организацией, деятельность
              на территории России запрещена)
            </p>
          )}
        </div>
      </Container>
    </footer>
  )
}
