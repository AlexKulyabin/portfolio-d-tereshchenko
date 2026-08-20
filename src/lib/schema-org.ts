import type { FaqItem, Service, SiteContent } from '@/schemas/content'
import { absoluteUrl } from './utils'

/**
 * Микроразметка Schema.org.
 *
 * Яндекс и Google используют её для расширенных сниппетов: блок вопросов
 * и ответов прямо в выдаче заметно повышает кликабельность, а данные
 * организации помогают связать сайт с карточкой компании.
 */

export function organizationSchema(content: SiteContent): Record<string, unknown> {
  const { settings, expert } = content
  const url = settings.siteUrl
  const organizationId = url ? `${url.replace(/\/$/, '')}#organization` : undefined

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    ...(organizationId && { '@id': organizationId }),
    name: settings.siteName,
    url,
    inLanguage: 'ru-RU',
    description: content.home.seo.description,
    ...(settings.contacts.phone && { telephone: settings.contacts.phone }),
    ...(settings.contacts.email && { email: settings.contacts.email }),
    ...(settings.contacts.city && {
      address: {
        '@type': 'PostalAddress',
        addressLocality: settings.contacts.city,
        addressCountry: 'RU',
        ...(settings.legal.address && { streetAddress: settings.legal.address }),
      },
    }),
    areaServed: { '@type': 'Country', name: 'Россия' },
    founder: {
      '@type': 'Person',
      ...(url && { '@id': `${url.replace(/\/$/, '')}#expert` }),
      name: expert.name,
      jobTitle: expert.role,
    },
    knowsAbout: [
      'Оценка профессиональных рисков',
      'Нормирование труда',
      'Система ХАССП',
      'Охрана труда',
      'Безопасность пищевой продукции',
    ],
    ...(settings.legal.inn && { taxID: settings.legal.inn }),
  }
}

/** Эксперт указан явно, чтобы поисковик мог связать статьи и услуги с автором. */
export function personSchema(content: SiteContent): Record<string, unknown> {
  const { settings, expert } = content
  const url = settings.siteUrl
  const imageUrl = expert.photo.url.startsWith('/placeholders/') ? '' : expert.photo.url

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    ...(url && { '@id': `${url.replace(/\/$/, '')}#expert` }),
    name: expert.name,
    jobTitle: expert.role,
    ...(expert.bio && { description: expert.bio }),
    ...(imageUrl && {
      image: imageUrl.startsWith('http') ? imageUrl : absoluteUrl(url, imageUrl),
    }),
    ...(url && { url }),
    knowsAbout: [
      'Оценка профессиональных рисков',
      'Нормирование труда',
      'Система ХАССП',
      'Охрана труда',
      'Безопасность пищевой продукции',
    ],
  }
}

/** Сущность сайта помогает связать главную, услуги и организацию в едином графе данных. */
export function websiteSchema(content: SiteContent): Record<string, unknown> {
  const url = content.settings.siteUrl

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    ...(url && { '@id': `${url.replace(/\/$/, '')}#website` }),
    name: content.settings.siteName,
    ...(url && { url }),
    inLanguage: 'ru-RU',
    publisher: {
      '@type': 'ProfessionalService',
      ...(url && { '@id': `${url.replace(/\/$/, '')}#organization` }),
      name: content.settings.siteName,
    },
  }
}

export function serviceSchema(content: SiteContent, service: Service): Record<string, unknown> {
  const { settings } = content
  const organizationId = settings.siteUrl
    ? `${settings.siteUrl.replace(/\/$/, '')}#organization`
    : undefined
  const offers = service.packages
    .filter((pkg) => pkg.price)
    .map((pkg) => ({
      '@type': 'Offer',
      name: pkg.name,
      price: pkg.price.replace(/[^\d]/g, '') || undefined,
      priceCurrency: 'RUB',
      description: pkg.description || undefined,
    }))

  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.seo.description,
    serviceType: service.title,
    url: settings.siteUrl ? absoluteUrl(settings.siteUrl, `/${service.slug}`) : undefined,
    provider: {
      '@type': 'ProfessionalService',
      ...(organizationId && { '@id': organizationId }),
      name: settings.siteName,
      ...(settings.contacts.phone && { telephone: settings.contacts.phone }),
    },
    areaServed: { '@type': 'Country', name: 'Россия' },
    ...(offers.length > 0 && {
      offers: { '@type': 'AggregateOffer', priceCurrency: 'RUB', offers },
    }),
  }
}

export function webPageSchema(
  content: SiteContent,
  path: string,
  title: string,
  description: string,
): Record<string, unknown> {
  const url = content.settings.siteUrl ? absoluteUrl(content.settings.siteUrl, path) : undefined

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    ...(url && { '@id': `${url}#webpage`, url }),
    name: title,
    description,
    inLanguage: 'ru-RU',
    isPartOf: {
      '@type': 'WebSite',
      ...(content.settings.siteUrl && { '@id': `${content.settings.siteUrl.replace(/\/$/, '')}#website` }),
      name: content.settings.siteName,
    },
    about: {
      '@type': 'ProfessionalService',
      ...(content.settings.siteUrl && {
        '@id': `${content.settings.siteUrl.replace(/\/$/, '')}#organization`,
      }),
      name: content.settings.siteName,
    },
  }
}

export function faqSchema(items: FaqItem[]): Record<string, unknown> | null {
  if (items.length === 0) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }
}

export function breadcrumbSchema(
  siteUrl: string,
  trail: Array<{ name: string; path: string }>,
): Record<string, unknown> | null {
  if (!siteUrl || trail.length === 0) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(siteUrl, item.path),
    })),
  }
}
