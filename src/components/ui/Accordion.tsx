import { useId, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FaqItem } from '@/schemas/content'

/**
 * Блок вопросов и ответов.
 *
 * Ответы присутствуют в разметке всегда, а не подставляются по клику:
 * так поисковый робот видит текст, и микроразметка FAQPage работает.
 * Скрытие сделано через hidden — контент остаётся в DOM.
 */
export function Faq({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const baseId = useId()

  if (items.length === 0) return null

  return (
    <div className="divide-y divide-line overflow-hidden rounded-2xl bg-white ring-1 ring-line">
      {items.map((item, index) => {
        const isOpen = openIndex === index
        const panelId = `${baseId}-panel-${index}`
        const buttonId = `${baseId}-button-${index}`

        return (
          <div key={`${item.q}-${index}`}>
            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-start justify-between gap-4 px-5 py-5 text-left transition-colors hover:bg-brand-50/60 sm:px-7 sm:py-6"
              >
                <span className="font-display text-lg font-semibold text-navy-900">{item.q}</span>
                <ChevronDown
                  aria-hidden="true"
                  className={cn(
                    'mt-1 size-5 shrink-0 text-brand-700 transition-transform duration-300',
                    isOpen && 'rotate-180',
                  )}
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
              className="px-5 pb-6 text-ink-600 sm:px-7"
            >
              {item.a}
            </div>
          </div>
        )
      })}
    </div>
  )
}
