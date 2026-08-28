import { Mail, MessageCircle, Phone, Send } from 'lucide-react'
import { useContent } from '@/lib/ContentProvider'
import { messengerHref, telHref } from '@/lib/utils'
import { trackGoal } from '@/lib/metrika'
import { Container, Section } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'
import { LeadForm } from './LeadForm'

/** Блок с формой заявки и прямыми контактами — завершает каждую страницу. */
export function CtaSection({ defaultService }: { defaultService?: string }) {
  const content = useContent()
  const { contacts } = content.settings
  const phoneLink = telHref(contacts.phoneRaw, contacts.phone)

  return (
    <Section
      id="zayavka"
      analyticsId="lead_form"
      tone="dark"
      className="relative overflow-hidden"
    >
      <div aria-hidden="true" className="absolute inset-0 bg-grid-overlay opacity-40" />
      <Container className="relative">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Reveal>
              <h2 className="text-3xl text-white sm:text-4xl">
                {content.cta.title || 'Рассчитаю стоимость за 15 минут'}
              </h2>
              <p className="mt-5 text-lg text-white/70">
                {content.cta.subtitle ||
                  'Оставьте контакты — уточню детали, назову точную цену и срок.'}
              </p>

              <div className="mt-10 space-y-4">
                {phoneLink && (
                  <a
                    href={phoneLink}
                    onClick={() => trackGoal('click_phone', { placement: 'cta_block' })}
                    className="flex items-center gap-4 rounded-xl bg-white/5 px-5 py-4 ring-1 ring-white/10 transition-colors hover:bg-white/10"
                  >
                    <Phone aria-hidden="true" className="size-5 shrink-0 text-accent-400" />
                    <span className="font-display text-lg font-semibold text-white">
                      {contacts.phone}
                    </span>
                  </a>
                )}
                {contacts.email && (
                  <a
                    href={`mailto:${contacts.email}`}
                    onClick={() => trackGoal('click_email', { placement: 'cta_block' })}
                    className="flex items-center gap-4 rounded-xl bg-white/5 px-5 py-4 text-white/80 ring-1 ring-white/10 transition-colors hover:bg-white/10"
                  >
                    <Mail aria-hidden="true" className="size-5 shrink-0 text-accent-400" />
                    {contacts.email}
                  </a>
                )}
                <div className="flex gap-4">
                  {contacts.telegram && (
                    <a
                      href={messengerHref(contacts.telegram, 'telegram')}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackGoal('click_telegram', { placement: 'cta_block' })}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/5 px-5 py-4 text-white/80 ring-1 ring-white/10 transition-colors hover:bg-white/10"
                    >
                      <Send aria-hidden="true" className="size-5 text-accent-400" />
                      Telegram
                    </a>
                  )}
                  {contacts.whatsapp && (
                    <a
                      href={messengerHref(contacts.whatsapp, 'whatsapp')}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackGoal('click_whatsapp', { placement: 'cta_block' })}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/5 px-5 py-4 text-white/80 ring-1 ring-white/10 transition-colors hover:bg-white/10"
                    >
                      <MessageCircle aria-hidden="true" className="size-5 text-accent-400" />
                      WhatsApp*
                    </a>
                  )}
                </div>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <Reveal delay={80}>
              <LeadForm defaultService={defaultService} />
            </Reveal>
          </div>
        </div>
      </Container>
    </Section>
  )
}
