/** Склейка классов с отсевом пустых значений. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}

/** Телефон в вид, пригодный для атрибута href="tel:". */
export function telHref(phoneRaw: string, phone: string): string {
  const source = phoneRaw || phone
  const cleaned = source.replace(/[^\d+]/g, '')
  return cleaned ? `tel:${cleaned}` : ''
}

/** Приводит ссылку на мессенджер к абсолютному виду. */
export function messengerHref(value: string, kind: 'telegram' | 'whatsapp'): string {
  if (!value) return ''
  if (value.startsWith('http')) return value
  if (kind === 'telegram') return `https://t.me/${value.replace(/^@/, '')}`
  return `https://wa.me/${value.replace(/[^\d]/g, '')}`
}

/** Абсолютный URL страницы — нужен для канонических ссылок и микроразметки. */
export function absoluteUrl(siteUrl: string, path: string): string {
  const base = siteUrl.replace(/\/$/, '')
  const suffix = path.startsWith('/') ? path : `/${path}`
  return `${base}${suffix === '/' ? '' : suffix}`
}
