import { Phone, Send } from 'lucide-react'
import { useContent } from '@/lib/ContentProvider'
import { messengerHref, telHref } from '@/lib/utils'
import { trackGoal } from '@/lib/metrika'

/**
 * Липкая панель действий на мобильных.
 *
 * С РСЯ приходит преимущественно мобильный трафик, и кнопка звонка,
 * доступная в любой момент прокрутки, заметно поднимает конверсию.
 */
export function MobileCta() {
  const { settings } = useContent()
  const { contacts } = settings
  const phoneLink = telHref(contacts.phoneRaw, contacts.phone)
  const telegramLink = messengerHref(contacts.telegram, 'telegram')

  if (!phoneLink && !telegramLink) return null

  return (
    <div className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-4 py-3 backdrop-blur-md lg:hidden">
      <div className="flex gap-3">
        {phoneLink && (
          <a
            href={phoneLink}
            onClick={() => trackGoal('click_phone')}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-brand-700 font-medium text-white"
          >
            <Phone aria-hidden="true" className="size-5" />
            Позвонить
          </a>
        )}
        {telegramLink && (
          <a
            href={telegramLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackGoal('click_telegram')}
            aria-label="Написать в Telegram"
            className="flex size-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700"
          >
            <Send aria-hidden="true" className="size-5" />
          </a>
        )}
      </div>
    </div>
  )
}
