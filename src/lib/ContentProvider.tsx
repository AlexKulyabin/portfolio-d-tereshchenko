import { createContext, use, useEffect, useState, type ReactNode } from 'react'
import type { SiteContent } from '@/schemas/content'
import { buildTimeContent, fetchPublishedContent } from './content'

const ContentContext = createContext<SiteContent>(buildTimeContent)

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>(buildTimeContent)

  useEffect(() => {
    const controller = new AbortController()

    // Обновление ищем без спешки: первый экран уже отрисован запечённым
    // контентом, и мешать ему сетевым запросом незачем.
    const schedule =
      typeof requestIdleCallback === 'function'
        ? requestIdleCallback
        : (cb: () => void) => setTimeout(cb, 400)

    const handle = schedule(() => {
      void fetchPublishedContent(buildTimeContent.version, controller.signal).then((fresh) => {
        if (fresh) setContent(fresh)
      })
    })

    return () => {
      controller.abort()
      if (typeof cancelIdleCallback === 'function' && typeof handle === 'number') {
        cancelIdleCallback(handle)
      }
    }
  }, [])

  return <ContentContext value={content}>{children}</ContentContext>
}

export function useContent(): SiteContent {
  return use(ContentContext)
}
