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

if (existsSync(snapshotPath)) {
  try {
    const snapshot = JSON.parse(await readFile(snapshotPath, 'utf8'))
    if (snapshot.settings?.siteUrl) siteUrl = snapshot.settings.siteUrl
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
const today = new Date().toISOString().slice(0, 10)

const pages = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  ...slugs.map((slug) => ({ path: `/${slug}`, priority: '0.9', changefreq: 'monthly' })),
  { path: '/kontakty', priority: '0.6', changefreq: 'monthly' },
  { path: '/politika-konfidencialnosti', priority: '0.2', changefreq: 'yearly' },
  { path: '/soglasie-na-obrabotku-dannyh', priority: '0.2', changefreq: 'yearly' },
]

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (page) => `  <url>
    <loc>${base}${page.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`

const robots = `User-agent: *
Allow: /
Disallow: /admin

Sitemap: ${base}/sitemap.xml
`

await writeFile(resolve(dist, 'sitemap.xml'), sitemap, 'utf8')
await writeFile(resolve(dist, 'robots.txt'), robots, 'utf8')

console.log(`[sitemap] создан sitemap.xml (${pages.length} страниц) и robots.txt для ${base}`)
