import { createContext, use, useEffect, type ReactNode } from 'react'

/**
 * Управление содержимым <head>.
 *
 * Своё, а не библиотека: нужно ровно две вещи — собрать теги при
 * пререндере в строку и обновлять их при переходах в браузере.
 *
 * На сервере собранные теги попадают в HTML, поэтому поисковый робот
 * видит нужные title и description сразу. В браузере при переходе между
 * страницами теги переписываются точечно, по метке data-head.
 */

export type MetaTag = { name?: string; property?: string; content: string }

export type HeadData = {
  title: string
  meta: MetaTag[]
  canonical?: string
  jsonLd: Array<Record<string, unknown>>
}

/** Собирает теги во время серверного рендера. */
export class HeadCollector {
  data: HeadData | null = null

  collect(data: HeadData) {
    this.data = data
  }

  /** Экранирование обязательно: в текстах бывают кавычки и угловые скобки. */
  private static escape(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }

  toHtml(): string {
    if (!this.data) return ''
    const { title, meta, canonical, jsonLd } = this.data
    const escape = HeadCollector.escape
    const parts: string[] = [`<title data-head>${escape(title)}</title>`]

    for (const tag of meta) {
      const attribute = tag.name ? `name="${escape(tag.name)}"` : `property="${escape(tag.property ?? '')}"`
      parts.push(`<meta ${attribute} content="${escape(tag.content)}" data-head>`)
    }

    if (canonical) parts.push(`<link rel="canonical" href="${escape(canonical)}" data-head>`)

    for (const schema of jsonLd) {
      // Закрывающий тег внутри JSON разорвал бы скрипт раньше времени.
      const json = JSON.stringify(schema).replace(/</g, '\\u003c')
      parts.push(`<script type="application/ld+json" data-head>${json}</script>`)
    }

    return parts.join('\n    ')
  }
}

const HeadContext = createContext<HeadCollector | null>(null)

export function HeadProvider({
  collector,
  children,
}: {
  collector: HeadCollector | null
  children: ReactNode
}) {
  return <HeadContext value={collector}>{children}</HeadContext>
}

/** Применяет теги: при пререндере — в коллектор, в браузере — к документу. */
export function useHead(data: HeadData): void {
  const collector = use(HeadContext)
  collector?.collect(data)

  useEffect(() => {
    document.title = data.title

    // Снимаем теги предыдущей страницы, кроме тех, что заданы в index.html.
    for (const node of document.head.querySelectorAll('[data-head]')) {
      if (node.tagName !== 'TITLE') node.remove()
    }

    const append = (element: HTMLElement) => {
      element.setAttribute('data-head', '')
      document.head.appendChild(element)
    }

    for (const tag of data.meta) {
      const meta = document.createElement('meta')
      if (tag.name) meta.setAttribute('name', tag.name)
      if (tag.property) meta.setAttribute('property', tag.property)
      meta.setAttribute('content', tag.content)
      append(meta)
    }

    if (data.canonical) {
      const link = document.createElement('link')
      link.rel = 'canonical'
      link.href = data.canonical
      append(link)
    }

    for (const schema of data.jsonLd) {
      const script = document.createElement('script')
      script.type = 'application/ld+json'
      script.textContent = JSON.stringify(schema)
      append(script)
    }
    // Сериализация — самый простой честный способ сравнить вложенные данные.
  }, [JSON.stringify(data)])
}
