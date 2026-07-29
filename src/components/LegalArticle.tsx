import type { ReactNode } from 'react'

/**
 * Оформление юридических текстов.
 *
 * Отдельный компонент, потому что типографика здесь отличается от
 * маркетинговых страниц: мельче кегль, плотнее ритм, нумерованные
 * заголовки — читать такое подряд никто не будет, но найти нужный
 * пункт должно быть легко.
 */
export function LegalArticle({ children }: { children: ReactNode }) {
  return (
    <article
      className="mx-auto max-w-3xl text-[1rem] leading-relaxed text-ink-700
        [&_a]:text-brand-700 [&_a]:underline [&_a]:underline-offset-2
        [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-navy-900
        [&_h2:first-child]:mt-0
        [&_li]:mb-2
        [&_p]:mb-4
        [&_strong]:font-semibold [&_strong]:text-navy-900
        [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6"
    >
      {children}
    </article>
  )
}
