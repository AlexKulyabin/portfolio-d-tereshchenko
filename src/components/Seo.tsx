import { useContent } from '@/lib/ContentProvider'
import { useHead, type MetaTag } from '@/lib/head'
import { absoluteUrl } from '@/lib/utils'

type SeoProps = {
  title: string
  description: string
  path: string
  ogImage?: string
  noindex?: boolean
  /** Микроразметка Schema.org — попадает в страницу как JSON-LD */
  jsonLd?: Array<Record<string, unknown>>
}

/**
 * Мета-теги страницы: title, описание, канонический адрес, Open Graph
 * и микроразметка. Всё, что нужно поисковикам и превью в мессенджерах.
 */
export function Seo({ title, description, path, ogImage, noindex, jsonLd }: SeoProps) {
  const { settings } = useContent()
  const siteUrl = settings.siteUrl || import.meta.env.VITE_SITE_URL || ''
  const canonical = siteUrl ? absoluteUrl(siteUrl, path) : undefined
  const image = ogImage ? (ogImage.startsWith('http') ? ogImage : absoluteUrl(siteUrl, ogImage)) : undefined

  const meta: MetaTag[] = [
    { name: 'description', content: description },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: settings.siteName },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:locale', content: 'ru_RU' },
    { name: 'twitter:card', content: image ? 'summary_large_image' : 'summary' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
  ]

  if (noindex) meta.push({ name: 'robots', content: 'noindex, nofollow' })
  if (canonical) meta.push({ property: 'og:url', content: canonical })
  if (image) {
    meta.push({ property: 'og:image', content: image })
    meta.push({ name: 'twitter:image', content: image })
  }
  if (settings.analytics.yandexVerification) {
    meta.push({ name: 'yandex-verification', content: settings.analytics.yandexVerification })
  }
  if (settings.analytics.googleVerification) {
    meta.push({ name: 'google-site-verification', content: settings.analytics.googleVerification })
  }

  useHead({ title, meta, canonical, jsonLd: jsonLd ?? [] })

  return null
}
