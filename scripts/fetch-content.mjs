import { writeFile, mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { loadEnv } from './lib/env.mjs'

/**
 * Выгружает опубликованный контент перед сборкой.
 *
 * Забирает тот же файл, который читает сайт в браузере, и кладёт его в
 * src/content/snapshot.json — оттуда пререндер запекает тексты и цены
 * прямо в HTML. Поисковый робот и первый экран не ждут ни одного запроса.
 *
 * Если контент недоступен (проект ещё не настроен, нет сети, из админки
 * ни разу не публиковали), сборка продолжается на стартовом наполнении
 * из src/content/default.ts. Падать здесь нельзя: деплой не должен
 * зависеть от доступности стороннего сервиса.
 */

const env = loadEnv()
const bucket = env.VITE_FIREBASE_STORAGE_BUCKET
const target = resolve(process.cwd(), 'src/content/snapshot.json')

if (!bucket) {
  console.warn('[content] VITE_FIREBASE_STORAGE_BUCKET не задан — беру стартовое наполнение')
  process.exit(0)
}

// При локальной разработке контент лежит в эмуляторе, а не в облаке.
const host =
  env.VITE_USE_EMULATORS === 'true'
    ? 'http://127.0.0.1:9199'
    : 'https://firebasestorage.googleapis.com'

const url = `${host}/v0/b/${bucket}/o/${encodeURIComponent('public/content.json')}?alt=media`

try {
  const response = await fetch(url, { signal: AbortSignal.timeout(15_000) })

  if (!response.ok) {
    console.warn(
      `[content] контент недоступен (ответ ${response.status}) — беру стартовое наполнение`,
    )
    process.exit(0)
  }

  const data = await response.json()

  if (typeof data?.version !== 'number' || !Array.isArray(data?.services)) {
    console.warn('[content] получен неожиданный формат — беру стартовое наполнение')
    process.exit(0)
  }

  await mkdir(resolve(process.cwd(), 'src/content'), { recursive: true })
  await writeFile(target, JSON.stringify(data, null, 2), 'utf8')

  console.log(
    `[content] версия ${data.version}${
      data.publishedAt ? ` от ${new Date(data.publishedAt).toLocaleString('ru-RU')}` : ''
    } записана в снапшот`,
  )
} catch (error) {
  console.warn(`[content] не удалось получить контент (${error.message}) — беру стартовое наполнение`)
}
