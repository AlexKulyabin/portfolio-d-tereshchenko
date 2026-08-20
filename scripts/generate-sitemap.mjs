import { writeFile, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { loadEnv } from './lib/env.mjs'

/**
 * Генерирует sitemap.xml и robots.txt после сборки.
 *
 * Адрес сайта берётся из опубликованного контента, потому что заказчик
 * задаёт его в админке. Если там пусто — из переменной окружения.
 */

const env = loadEnv()
const dist = resolve(process.cwd(), 'dist')
const snapshotPath = resolve(process.cwd(), 'src/content/snapshot.json')

let siteUrl = env.VITE_SITE_URL ?? ''
let slugs = ['otsenka-professionalnyh-riskov', 'normirovanie-truda', 'razrabotka-hassp']
let publishedAt = ''

if (existsSync(snapshotPath)) {
  try {
    const snapshot = JSON.parse(await readFile(snapshotPath, 'utf8'))
    if (snapshot.settings?.siteUrl) siteUrl = snapshot.settings.siteUrl
    if (typeof snapshot.publishedAt === 'string') publishedAt = snapshot.publishedAt
    if (Array.isArray(snapshot.services) && snapshot.services.length > 0) {
      slugs = snapshot.services.map((service) => service.slug)
    }
  } catch {
    // Снапшот повреждён — берём значения по умолчанию.
  }
}

// Плейсхолдер из .env.example — не адрес, а признак незаполненной настройки.
const PLACEHOLDERS = new Set(['https://example.ru', 'http://example.ru'])

if (!siteUrl || PLACEHOLDERS.has(siteUrl.replace(/\/$/, ''))) {
  console.warn('[sitemap] адрес сайта не задан — файлы не созданы')
  console.warn('[sitemap] укажите его в админке (Контакты и настройки → Адрес сайта)')
  process.exit(0)
}

const base = siteUrl.replace(/\/$/, '')
// Дата должна отражать обновление контента, а не каждый технический деплой.
const lastmod = /^\d{4}-\d{2}-\d{2}/.test(publishedAt)
  ? publishedAt.slice(0, 10)
  : new Date().toISOString().slice(0, 10)

const pages = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  ...slugs.map((slug) => ({ path: `/${slug}`, priority: '0.9', changefreq: 'monthly' })),
  { path: '/kontakty', priority: '0.6', changefreq: 'monthly' },
]

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (page) => `  <url>
    <loc>${base}${page.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`

const robots = `# ChatGPT Search: разрешаем OAI-SearchBot.
User-agent: OAI-SearchBot
Allow: /
Disallow: /admin

# Не разрешаем использовать материалы сайта для обучения моделей.
# Это не запрещает появление сайта в ChatGPT Search.
User-agent: GPTBot
Disallow: /

# Алиса AI использует индекс Яндекса; не ограничиваем YandexAdditionalBot.
User-agent: YandexAdditionalBot
Allow: /
Disallow: /admin

User-agent: *
Allow: /
Disallow: /admin

# Параметры рекламных систем не создают отдельные поисковые документы в Яндексе.
Clean-param: utm_source&utm_medium&utm_campaign&utm_term&utm_content&yclid&gclid /

Sitemap: ${base}/sitemap.xml
`

await writeFile(resolve(dist, 'sitemap.xml'), sitemap, 'utf8')
await writeFile(resolve(dist, 'robots.txt'), robots, 'utf8')

console.log(`[sitemap] создан sitemap.xml (${pages.length} страниц) и robots.txt для ${base}`)
