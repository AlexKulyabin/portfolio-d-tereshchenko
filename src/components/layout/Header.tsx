import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Mail, Menu, Phone, X } from 'lucide-react'
import { useContent } from '@/lib/ContentProvider'
import { sortedServices } from '@/lib/content'
import { cn, telHref } from '@/lib/utils'
import { rememberLeadContext, serviceFromPath, trackGoal } from '@/lib/metrika'
import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Section'
import { Logo } from './Logo'

export function Header() {
  const content = useContent()
  const services = sortedServices(content)
  const { contacts } = content.settings
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => setMenuOpen(false), [location.pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Пока открыто мобильное меню, страница под ним не должна прокручиваться.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const phoneLink = telHref(contacts.phoneRaw, contacts.phone)

  return (
    <header className="sticky top-0 z-50">
      {/* Верхняя полоса с контактами — по требованию «контакты наверху сайта» */}
      <div className="hidden bg-navy-950 text-white/80 lg:block">
        <Container>
          <div className="flex h-10 items-center justify-between text-sm">
            <p className="text-white/60">{contacts.geography || 'Работаем по всей России'}</p>
            <div className="flex items-center gap-6">
              {contacts.workHours && <span className="text-white/60">{contacts.workHours}</span>}
              {contacts.email && (
                <a
                  href={`mailto:${contacts.email}`}
                  onClick={() => trackGoal('click_email', { placement: 'header_desktop' })}
                  className="flex items-center gap-2 transition-colors hover:text-white"
                >
                  <Mail aria-hidden="true" className="size-4" />
                  {contacts.email}
                </a>
              )}
              {phoneLink && (
                <a
                  href={phoneLink}
                  onClick={() => trackGoal('click_phone', { placement: 'header_desktop' })}
                  className="flex items-center gap-2 font-medium text-white transition-colors hover:text-accent-400"
                >
                  <Phone aria-hidden="true" className="size-4" />
                  {contacts.phone}
                </a>
              )}
            </div>
          </div>
        </Container>
      </div>

      <div
        className={cn(
          'border-b transition-all duration-300',
          scrolled
            ? 'border-line bg-white/90 backdrop-blur-md shadow-[0_1px_16px_-8px_rgba(15,23,42,0.25)]'
            : 'border-transparent bg-white',
        )}
      >
        <Container>
          <div className="flex h-18 items-center justify-between gap-6 py-3">
            <Logo />

            {/* whitespace-nowrap обязателен: названия услуг длинные и без
                запрета переноса разваливают шапку на три строки */}
            <nav aria-label="Основная навигация" className="hidden items-center gap-1 lg:flex">
              {services.map((service) => (
                <NavLink
                  key={service.slug}
                  to={`/${service.slug}`}
                  onClick={() =>
                    trackGoal('service_open', {
                      service: service.slug,
                      placement: 'header_desktop_nav',
                    })
                  }
                  className={({ isActive }) =>
                    cn(
                      'rounded-lg px-2.5 py-2 text-[0.9rem] font-medium whitespace-nowrap transition-colors xl:px-3 xl:text-[0.95rem]',
                      isActive ? 'text-brand-700' : 'text-ink-700 hover:text-brand-700',
                    )
                  }
                >
                  {service.shortTitle}
                </NavLink>
              ))}
              <NavLink
                to="/kontakty"
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-2.5 py-2 text-[0.9rem] font-medium whitespace-nowrap transition-colors xl:px-3 xl:text-[0.95rem]',
                    isActive ? 'text-brand-700' : 'text-ink-700 hover:text-brand-700',
                  )
                }
              >
                Контакты
              </NavLink>
            </nav>

            <div className="hidden lg:block">
              <ButtonLink
                to="/#zayavka"
                onClick={() => {
                  const service = serviceFromPath()
                  rememberLeadContext(service, 'header_desktop')
                  trackGoal('cta_click', { service, placement: 'header_desktop' })
                }}
              >
                Получить расчёт
              </ButtonLink>
            </div>

            <div className="flex items-center gap-2 lg:hidden">
              {phoneLink && (
                <a
                  href={phoneLink}
                  aria-label={`Позвонить по номеру ${contacts.phone}`}
                  onClick={() => trackGoal('click_phone', { placement: 'header_mobile' })}
                  className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700"
                >
                  <Phone aria-hidden="true" className="size-5" />
                </a>
              )}
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
                className="flex size-11 items-center justify-center rounded-xl text-navy-900 ring-1 ring-line"
              >
                {menuOpen ? (
                  <X aria-hidden="true" className="size-5" />
                ) : (
                  <Menu aria-hidden="true" className="size-5" />
                )}
              </button>
            </div>
          </div>
        </Container>
      </div>

      {menuOpen && (
        <div id="mobile-menu" className="fixed inset-x-0 top-[4.5rem] bottom-0 z-40 bg-white lg:hidden">
          <Container className="flex h-full flex-col overflow-y-auto py-6">
            <nav aria-label="Мобильная навигация" className="flex flex-col gap-1">
              {services.map((service) => (
                <Link
                  key={service.slug}
                  to={`/${service.slug}`}
                  onClick={() =>
                    trackGoal('service_open', {
                      service: service.slug,
                      placement: 'header_mobile_nav',
                    })
                  }
                  className="rounded-xl px-4 py-4 font-display text-lg font-semibold text-navy-900 transition-colors hover:bg-brand-50"
                >
                  {service.shortTitle}
                </Link>
              ))}
              <Link
                to="/kontakty"
                className="rounded-xl px-4 py-4 font-display text-lg font-semibold text-navy-900 transition-colors hover:bg-brand-50"
              >
                Контакты
              </Link>
            </nav>

            <div className="mt-6 space-y-3 border-t border-line pt-6">
              {phoneLink && (
                <a
                  href={phoneLink}
                  onClick={() => trackGoal('click_phone', { placement: 'header_mobile_menu' })}
                  className="flex items-center gap-3 px-4 py-2 text-lg font-medium text-navy-900"
                >
                  <Phone aria-hidden="true" className="size-5 text-brand-700" />
                  {contacts.phone}
                </a>
              )}
              {contacts.email && (
                <a
                  href={`mailto:${contacts.email}`}
                  onClick={() => trackGoal('click_email', { placement: 'header_mobile_menu' })}
                  className="flex items-center gap-3 px-4 py-2 text-ink-600"
                >
                  <Mail aria-hidden="true" className="size-5 text-brand-700" />
                  {contacts.email}
                </a>
              )}
              <ButtonLink
                to="/#zayavka"
                size="lg"
                className="w-full"
                onClick={() => {
                  const service = serviceFromPath()
                  rememberLeadContext(service, 'header_mobile_menu')
                  trackGoal('cta_click', { service, placement: 'header_mobile_menu' })
                }}
              >
                Получить расчёт
              </ButtonLink>
            </div>
          </Container>
        </div>
      )}
    </header>
  )
}
