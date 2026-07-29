import { siteContentSchema, type SiteContent } from '@/schemas/content'
import { defaultContent } from '@/content/default'

/**
 * Откуда сайт берёт контент.
 *
 * 1. При сборке скрипт `npm run content:pull` выгружает опубликованный
 *    контент из Firestore в src/content/snapshot.json. Пререндер запекает
 *    его прямо в HTML — робот и первый экран не ждут ни одного запроса.
 * 2. После гидратации страница одним запросом забирает content.json,
 *    который админка кладёт в Storage при публикации. Если его версия
 *    новее запечённой, тексты обновляются на лету.
 * 3. Если ничего не доступно (например, при первом запуске проекта),
 *    используется стартовое наполнение из src/content/default.ts.
 *
 * Практический смысл: правка в админке видна на сайте сразу, а в HTML
 * для поисковых роботов попадает при следующей пересборке.
 */

/** Файла может не быть — glob в этом случае вернёт пустой объект, а не ошибку сборки. */
const snapshotModules = import.meta.glob<{ default: unknown }>('../content/snapshot.json', {
  eager: true,
})

function readSnapshot(): SiteContent {
  const mod = Object.values(snapshotModules)[0]
  if (!mod) return defaultContent

  const parsed = siteContentSchema.safeParse(mod.default)
  if (!parsed.success) {
    console.warn('[content] снапшот не прошёл проверку схемы, используется стартовое наполнение')
    return defaultContent
  }
  return parsed.data
}

/** Контент, запечённый в сборку. Доступен синхронно — в том числе при пререндере. */
export const buildTimeContent: SiteContent = readSnapshot()

export const PUBLISHED_CONTENT_PATH = 'public/content.json'

/** Публичный адрес опубликованного контента в Firebase Storage. */
export function publishedContentUrl(): string | null {
  const bucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET
  if (!bucket) return null

  // При локальной разработке файл лежит в эмуляторе, а не в облаке.
  const host =
    import.meta.env.VITE_USE_EMULATORS === 'true'
      ? 'http://127.0.0.1:9199'
      : 'https://firebasestorage.googleapis.com'

  return `${host}/v0/b/${bucket}/o/${encodeURIComponent(PUBLISHED_CONTENT_PATH)}?alt=media`
}

/**
 * Забирает свежий контент. Возвращает null, если обновление не нужно
 * или недоступно — вызывающий код в этом случае просто оставляет
 * запечённую версию.
 */
export async function fetchPublishedContent(
  currentVersion: number,
  signal?: AbortSignal,
): Promise<SiteContent | null> {
  const url = publishedContentUrl()
  if (!url) return null

  try {
    const response = await fetch(url, { signal, cache: 'no-cache' })
    if (!response.ok) return null

    const parsed = siteContentSchema.safeParse(await response.json())
    if (!parsed.success) {
      console.warn('[content] опубликованный контент не прошёл проверку схемы')
      return null
    }
    if (parsed.data.version <= currentVersion) return null
    return parsed.data
  } catch (error) {
    if ((error as Error)?.name === 'AbortError') return null
    console.warn('[content] не удалось загрузить обновление контента', error)
    return null
  }
}

export function findService(content: SiteContent, slug: string) {
  return content.services.find((service) => service.slug === slug)
}

export function sortedServices(content: SiteContent) {
  return [...content.services].sort((a, b) => a.order - b.order)
}
