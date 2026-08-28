import { Clock, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react'
import { useContent } from '@/lib/ContentProvider'
import { messengerHref, telHref } from '@/lib/utils'
import { organizationSchema, personSchema, webPageSchema } from '@/lib/schema-org'
import { trackGoal } from '@/lib/metrika'
import { Seo } from '@/components/Seo'
import { Container, Section } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'
import { CtaSection } from '@/components/sections/CtaSection'

export default function ContactsPage() {
  const content = useContent()
  const { contacts, legal } = content.settings
  const phoneLink = telHref(contacts.phoneRaw, contacts.phone)

  const items = [
    phoneLink && {
      icon: Phone,
      label: 'Телефон',
      value: contacts.phone,
      href: phoneLink,
      onClick: () => trackGoal('click_phone', { placement: 'contacts_page' }),
    },
    contacts.email && {
      icon: Mail,
      label: 'Электронная почта',
      value: contacts.email,
      href: `mailto:${contacts.email}`,
      onClick: () => trackGoal('click_email', { placement: 'contacts_page' }),
    },
    contacts.telegram && {
      icon: Send,
      label: 'Telegram',
      value: contacts.telegram.replace(/^https?:\/\/t\.me\//, '@'),
      href: messengerHref(contacts.telegram, 'telegram'),
      onClick: () => trackGoal('click_telegram', { placement: 'contacts_page' }),
    },
    contacts.whatsapp && {
      icon: MessageCircle,
      label: 'WhatsApp*',
      value: contacts.phone || 'Написать',
      href: messengerHref(contacts.whatsapp, 'whatsapp'),
      onClick: () => trackGoal('click_whatsapp', { placement: 'contacts_page' }),
    },
    contacts.city && { icon: MapPin, label: 'Город', value: contacts.city },
    contacts.workHours && { icon: Clock, label: 'Время работы', value: contacts.workHours },
  ].filter(Boolean) as Array<{
    icon: typeof Phone
    label: string
    value: string
    href?: string
    onClick?: () => void
  }>

  return (
    <>
      <Seo
        title={`Контакты — ${content.settings.siteName}`}
        description={`Связаться с экспертом по охране труда и пищевой безопасности. ${
          contacts.geography || 'Работаем по всей России'
        }.`}
        path="/kontakty"
        jsonLd={[
          organizationSchema(content),
          personSchema(content),
          webPageSchema(
            content,
            '/kontakty',
            `Контакты — ${content.settings.siteName}`,
            `Связаться с экспертом по охране труда и пищевой безопасности. ${
              contacts.geography || 'Работаем по всей России'
            }.`,
          ),
        ]}
      />

      <div className="bg-hero-gradient py-16 text-white sm:py-20">
        <Container>
          <h1 className="text-4xl sm:text-5xl">Контакты</h1>
          <p className="mt-5 max-w-2xl text-lg text-white/70">
            Позвоните или напишите удобным способом — отвечу в рабочее время и назову стоимость
            после короткого разговора.
          </p>
        </Container>
      </div>

      <Section analyticsId="contacts" tone="light">
        <Container>
          {items.length > 0 ? (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item, index) => {
                const Icon = item.icon
                const inner = (
                  <>
                    <span
                      aria-hidden="true"
                      className="flex size-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700"
                    >
                      <Icon className="size-6" />
                    </span>
                    <span className="mt-5 block text-sm text-ink-600">{item.label}</span>
                    <span className="mt-1 block font-display text-lg font-bold text-navy-900">
                      {item.value}
                    </span>
                  </>
                )

                return (
                  <Reveal key={item.label} as="li" delay={(index % 3) * 70}>
                    {item.href ? (
                      <a
                        href={item.href}
                        onClick={item.onClick}
                        {...(item.href.startsWith('http') && {
                          target: '_blank',
                          rel: 'noopener noreferrer',
                        })}
                        className="block h-full rounded-2xl bg-white p-7 ring-1 ring-line transition-all hover:-translate-y-0.5 hover:ring-brand-300"
                      >
                        {inner}
                      </a>
                    ) : (
                      <div className="h-full rounded-2xl bg-white p-7 ring-1 ring-line">{inner}</div>
                    )}
                  </Reveal>
                )
              })}
            </ul>
          ) : (
            <p className="text-ink-600">
              Контактные данные скоро появятся. Оставьте заявку в форме ниже — я свяжусь с вами.
            </p>
          )}

          {(legal.name || legal.inn || legal.ogrn) && (
            <Reveal delay={100}>
              <div className="mt-12 rounded-2xl bg-surface p-7">
                <h2 className="font-display text-lg font-bold text-navy-900">Реквизиты</h2>
                <dl className="mt-5 grid gap-4 text-[0.95rem] sm:grid-cols-2 lg:grid-cols-4">
                  {legal.name && (
                    <div>
                      <dt className="text-ink-600">Наименование</dt>
                      <dd className="mt-1 font-medium text-navy-900">{legal.name}</dd>
                    </div>
                  )}
                  {legal.inn && (
                    <div>
                      <dt className="text-ink-600">ИНН</dt>
                      <dd className="mt-1 font-medium text-navy-900">{legal.inn}</dd>
                    </div>
                  )}
                  {legal.ogrn && (
                    <div>
                      <dt className="text-ink-600">
                        ОГРН{legal.entityType === 'ip' ? 'ИП' : ''}
                      </dt>
                      <dd className="mt-1 font-medium text-navy-900">{legal.ogrn}</dd>
                    </div>
                  )}
                  {legal.address && (
                    <div>
                      <dt className="text-ink-600">Адрес</dt>
                      <dd className="mt-1 font-medium text-navy-900">{legal.address}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </Reveal>
          )}
        </Container>
      </Section>

      <CtaSection />
    </>
  )
}
