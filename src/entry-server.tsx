import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router'
import { HeadCollector, HeadProvider } from './lib/head'
import { routes, staticPaths } from './routes'

export { staticPaths }

/**
 * Точка входа пререндера.
 *
 * Для каждого адреса собирает готовый HTML страницы и набор тегов для
 * <head>. Вызывается из scripts/prerender.mjs во время сборки.
 */
export async function render(url: string): Promise<{ html: string; head: string }> {
  const handler = createStaticHandler(routes)
  const context = await handler.query(new Request(`http://localhost${url}`))

  if (context instanceof Response) {
    throw new Error(`Маршрут ${url} вернул перенаправление вместо страницы`)
  }

  const router = createStaticRouter(handler.dataRoutes, context)
  const collector = new HeadCollector()

  const html = renderToString(
    <StrictMode>
      <HeadProvider collector={collector}>
        <StaticRouterProvider router={router} context={context} hydrate={false} />
      </HeadProvider>
    </StrictMode>,
  )

  return { html, head: collector.toHtml() }
}
