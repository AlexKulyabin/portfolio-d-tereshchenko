import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { ContentProvider, useContent } from '@/lib/ContentProvider'
import { AnalyticsConsentProvider, useAnalyticsConsent } from '@/lib/AnalyticsConsentProvider'
import { initMetrika, trackPageView } from '@/lib/metrika'
import { CookieNotice } from '@/components/CookieNotice'
import { Header } from './Header'
import { Footer } from './Footer'
import { MobileCta } from './MobileCta'

/** Возврат к началу страницы при переходе по внутренней ссылке. */
function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      // Даём разметке отрисоваться, прежде чем искать якорь.
      requestAnimationFrame(() => {
        document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' })
      })
      return
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname, hash])

  return null
}

/**
 * Подключение Метрики и учёт переходов.
 *
 * Номер счётчика приходит из контента, поэтому заказчик может задать
 * или сменить его в админке без пересборки сайта.
 */
function Analytics() {
  const { settings } = useContent()
  const { consent } = useAnalyticsConsent()
  const location = useLocation()
  const previousPath = useRef<string | null>(null)

  useEffect(() => {
    if (consent !== 'accepted' || !settings.analytics.metrikaId) return

    const schedule =
      typeof requestIdleCallback === 'function'
        ? requestIdleCallback
        : (cb: () => void) => setTimeout(cb, 1500)
    schedule(() => initMetrika(settings.analytics.metrikaId))
  }, [consent, settings.analytics.metrikaId])

  useEffect(() => {
    const url = location.pathname + location.search
    // Первый просмотр Метрика засчитывает сама при инициализации.
    if (previousPath.current !== null && previousPath.current !== url) {
      trackPageView(url, previousPath.current)
    }
    previousPath.current = url
  }, [location.pathname, location.search])

  return null
}

export function Layout() {
  return (
    <AnalyticsConsentProvider>
      <ContentProvider>
        <ScrollToTop />
        <Analytics />
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1 pb-20 lg:pb-0">
            <Outlet />
          </main>
          <Footer />
          <MobileCta />
        </div>
        <CookieNotice />
      </ContentProvider>
    </AnalyticsConsentProvider>
  )
}
