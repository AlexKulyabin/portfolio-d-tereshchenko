import { readFile, writeFile, mkdir, rm } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { pathToFileURL } from 'node:url'

/**
 * Пререндер страниц.
 *
 * Берёт собранный серверный бандл, отрисовывает каждый публичный адрес
 * в готовый HTML и раскладывает файлы по папкам. Firebase Hosting отдаёт
 * их напрямую с CDN — посетитель видит текст, не дожидаясь JavaScript,
 * а поисковый робот получает полноценную страницу.
 *
 * Запускается из scripts/build.mjs после сборки клиента и сервера.
 */

const root = process.cwd()
const dist = resolve(root, 'dist')
const serverDist = resolve(root, 'dist-server')

const template = await readFile(resolve(dist, 'index.html'), 'utf8')
const { render, staticPaths } = await import(
  pathToFileURL(resolve(serverDist, 'entry-server.js')).href
)

let rendered = 0

for (const path of staticPaths) {
  const { html, head } = await render(path)

  const page = template
    .replace('</head>', `    ${head}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${html}</div>`)

  // «/» → dist/index.html, «/kontakty» → dist/kontakty/index.html.
  // Такая раскладка работает на любом статическом хостинге без правил.
  const target =
    path === '/' ? resolve(dist, 'index.html') : resolve(dist, `${path.slice(1)}/index.html`)

  await mkdir(dirname(target), { recursive: true })
  await writeFile(target, page, 'utf8')
  rendered += 1
}

// Отдельная копия для страницы ошибки: Firebase Hosting ищет именно 404.html.
await writeFile(
  resolve(dist, '404.html'),
  await readFile(resolve(dist, '404/index.html'), 'utf8'),
  'utf8',
)
await rm(resolve(dist, '404'), { recursive: true, force: true })

// Серверный бандл нужен только на время сборки.
await rm(serverDist, { recursive: true, force: true })

console.log(`[prerender] отрисовано страниц: ${rendered}`)
