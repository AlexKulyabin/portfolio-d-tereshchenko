import { siteContentSchema, type SiteContent } from '@/schemas/content'
import { defaultContent } from '@/content/default'
import { getDb, getFirebaseStorage } from '@/lib/firebase'
import { PUBLISHED_CONTENT_PATH } from '@/lib/content'

/**
 * Хранилище контента админки.
 *
 * Весь контент сайта лежит в одном документе Firestore. Это осознанный
 * выбор: объём укладывается в десятки килобайт при лимите документа в
 * мегабайт, зато сохранение и публикация становятся атомарными — сайт
 * никогда не увидит наполовину обновлённый контент.
 *
 *   content/draft      — черновик, с ним работает админка
 *   content/published  — последняя опубликованная версия
 *   content/history/*  — предыдущие публикации для отката
 *   Storage public/content.json — то, что читает сайт
 */

const DRAFT_PATH = ['content', 'draft'] as const
const PUBLISHED_PATH = ['content', 'published'] as const
const HISTORY_LIMIT = 10

export async function loadDraft(): Promise<SiteContent> {
  const [db, { doc, getDoc }] = await Promise.all([getDb(), import('firebase/firestore')])
  const snapshot = await getDoc(doc(db, ...DRAFT_PATH))

  if (!snapshot.exists()) return defaultContent

  const parsed = siteContentSchema.safeParse(snapshot.data())
  if (!parsed.success) {
    console.warn('[admin] черновик не прошёл проверку схемы, показано стартовое наполнение', parsed.error)
    return defaultContent
  }
  return parsed.data
}

export async function saveDraft(content: SiteContent): Promise<void> {
  const [db, { doc, setDoc }] = await Promise.all([getDb(), import('firebase/firestore')])
  await setDoc(doc(db, ...DRAFT_PATH), {
    ...content,
    updatedAt: new Date().toISOString(),
  })
}

export type PublishedInfo = { version: number; publishedAt: string } | null

export async function loadPublishedInfo(): Promise<PublishedInfo> {
  const [db, { doc, getDoc }] = await Promise.all([getDb(), import('firebase/firestore')])
  const snapshot = await getDoc(doc(db, ...PUBLISHED_PATH))
  if (!snapshot.exists()) return null

  const data = snapshot.data() as Partial<SiteContent>
  return { version: data.version ?? 0, publishedAt: data.publishedAt ?? '' }
}

/**
 * Публикация: версия увеличивается, копия уходит в историю, а итоговый
 * JSON выкладывается в Storage — именно его забирает публичный сайт.
 */
export async function publish(content: SiteContent): Promise<SiteContent> {
  const [db, storage, firestore, storageApi] = await Promise.all([
    getDb(),
    getFirebaseStorage(),
    import('firebase/firestore'),
    import('firebase/storage'),
  ])
  const { doc, getDoc, setDoc, collection, getDocs, deleteDoc, query, orderBy, limit } = firestore
  const { ref, uploadString } = storageApi

  const previous = await getDoc(doc(db, ...PUBLISHED_PATH))
  const previousVersion = previous.exists() ? ((previous.data().version as number) ?? 0) : 0

  const published: SiteContent = {
    ...content,
    version: Math.max(previousVersion, content.version) + 1,
    publishedAt: new Date().toISOString(),
  }

  // Предыдущую версию сохраняем перед перезаписью — чтобы было куда откатиться.
  if (previous.exists()) {
    await setDoc(doc(db, 'content', 'published', 'history', String(previousVersion)), previous.data())
  }

  await setDoc(doc(db, ...PUBLISHED_PATH), published)
  await setDoc(doc(db, ...DRAFT_PATH), { ...published, updatedAt: new Date().toISOString() })

  await uploadString(ref(storage, PUBLISHED_CONTENT_PATH), JSON.stringify(published), 'raw', {
    contentType: 'application/json; charset=utf-8',
    // Короткий кеш: правка должна доезжать до посетителей быстро,
    // а файл весит десятки килобайт и раздаётся с CDN.
    cacheControl: 'public, max-age=60, must-revalidate',
  })

  // История не должна расти бесконечно.
  const historyRef = collection(db, 'content', 'published', 'history')
  const stale = await getDocs(query(historyRef, orderBy('version', 'desc'), limit(HISTORY_LIMIT + 20)))
  const extra = stale.docs.slice(HISTORY_LIMIT)
  await Promise.all(extra.map((entry) => deleteDoc(entry.ref)))

  return published
}

export type HistoryEntry = { id: string; version: number; publishedAt: string }

export async function loadHistory(): Promise<HistoryEntry[]> {
  const [db, { collection, getDocs, query, orderBy, limit }] = await Promise.all([
    getDb(),
    import('firebase/firestore'),
  ])
  const snapshot = await getDocs(
    query(collection(db, 'content', 'published', 'history'), orderBy('version', 'desc'), limit(HISTORY_LIMIT)),
  )
  return snapshot.docs.map((entry) => {
    const data = entry.data() as Partial<SiteContent>
    return { id: entry.id, version: data.version ?? 0, publishedAt: data.publishedAt ?? '' }
  })
}

/** Возвращает контент из истории в черновик — публиковать его нужно отдельно. */
export async function restoreVersion(id: string): Promise<SiteContent> {
  const [db, { doc, getDoc, setDoc }] = await Promise.all([getDb(), import('firebase/firestore')])
  const snapshot = await getDoc(doc(db, 'content', 'published', 'history', id))
  if (!snapshot.exists()) throw new Error('Версия не найдена')

  const parsed = siteContentSchema.parse(snapshot.data())
  await setDoc(doc(db, ...DRAFT_PATH), { ...parsed, updatedAt: new Date().toISOString() })
  return parsed
}
