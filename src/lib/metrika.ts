/**
 * Яндекс.Метрика.
 *
 * Счётчик подключается после того, как страница стала интерактивной:
 * на LCP он влиять не должен. Номер счётчика приходит из контента,
 * поэтому заказчик может поменять его в админке без пересборки.
 */

let loadedId: number | null = null

const SERVICE_SLUGS = [
  'otsenka-professionalnyh-riskov',
  'normirovanie-truda',
  'razrabotka-hassp',
] as const

export type AnalyticsService = (typeof SERVICE_SLUGS)[number] | 'general' | 'multiple'

export type AnalyticsPlacement =
  | 'header_desktop'
  | 'header_desktop_nav'
  | 'header_mobile'
  | 'header_mobile_menu'
  | 'header_mobile_nav'
  | 'hero_home'
  | 'hero_service'
  | 'services_grid'
  | 'pricing'
  | 'cta_block'
  | 'lead_form'
  | 'contacts_page'
  | 'footer'
  | 'mobile_bar'
  | 'not_found'

export type MetrikaParams = Record<string, string | number | boolean | undefined>

type LeadAnalyticsContext = {
  service: AnalyticsService
  placement: AnalyticsPlacement
  packageName?: string
  savedAt: number
}

const LEAD_CONTEXT_KEY = 'expert-auditor-lead-analytics-v1'
const LEAD_CONTEXT_TTL = 30 * 60 * 1000

/** Цели, которые настраиваются в интерфейсе Метрики с этими же именами. */
export type MetrikaGoal =
  | 'form_submit'
  | 'click_phone'
  | 'click_email'
  | 'click_whatsapp'
  | 'click_telegram'
  | 'service_open'
  | 'cta_click'
  | 'package_select'
  | 'form_start'

/** Определяет направление по текущему адресу страницы. */
export function serviceFromPath(pathname?: string): AnalyticsService {
  const path = (pathname ?? (typeof window !== 'undefined' ? window.location.pathname : ''))
    .replace(/^\/+|\/+$/g, '')
  return SERVICE_SLUGS.includes(path as (typeof SERVICE_SLUGS)[number])
    ? (path as (typeof SERVICE_SLUGS)[number])
    : 'general'
}

/** Запоминает источник перехода к форме без персональных данных. */
export function rememberLeadContext(
  service: AnalyticsService,
  placement: AnalyticsPlacement,
  packageName?: string,
): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(
      LEAD_CONTEXT_KEY,
      JSON.stringify({ service, placement, packageName, savedAt: Date.now() }),
    )
  } catch {
    // Блокировка sessionStorage не должна мешать работе ссылок и формы.
  }
}

export function readLeadContext(): LeadAnalyticsContext | null {
  if (typeof window === 'undefined') return null
  try {
    const parsed = JSON.parse(sessionStorage.getItem(LEAD_CONTEXT_KEY) ?? 'null') as
      | LeadAnalyticsContext
      | null
    if (!parsed || Date.now() - parsed.savedAt > LEAD_CONTEXT_TTL) return null
    return parsed
  } catch {
    return null
  }
}

export function clearLeadContext(): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem(LEAD_CONTEXT_KEY)
  } catch {
    // Невозможность очистить технический контекст не влияет на заявку.
  }
}

export function initMetrika(counterId: string): void {
  if (typeof window === 'undefined') return

  const id = Number(counterId)
  if (!id || loadedId === id) return
  // В разработке счётчик не подключаем, чтобы не портить статистику.
  if (import.meta.env.DEV) return

  loadedId = id

  // Заглушка складывает вызовы в очередь, пока скрипт счётчика ещё грузится,
  // — это стандартное поведение сниппета Метрики.
  type Queued = typeof window.ym & { a?: unknown[][]; l?: number }
  const existing = window.ym as Queued | undefined

  if (!existing) {
    const stub = ((...args: unknown[]) => {
      ;(stub.a ??= []).push(args)
    }) as Queued & { a?: unknown[][] }
    stub.l = Date.now()
    window.ym = stub
  }

  const script = document.createElement('script')
  script.src = 'https://mc.yandex.ru/metrika/tag.js'
  script.async = true
  document.head.appendChild(script)

  window.ym?.(id, 'init', {
    defer: true,
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
    // Не записываем действия посетителей в Вебвизоре: на сайте есть форма с контактами.
    webvisor: false,
  })
}

/**
 * Переходы между страницами в одностраничном приложении Метрика сама
 * не видит — о них нужно сообщать явно, иначе весь визит засчитается
 * как просмотр одной страницы.
 */
export function trackPageView(url: string, referrer?: string): void {
  if (loadedId) window.ym?.(loadedId, 'hit', url, { referer: referrer })
}

export function trackGoal(goal: MetrikaGoal, params: MetrikaParams = {}): void {
  if (!loadedId || typeof window === 'undefined') return

  // Эти параметры позволяют разделять одноимённые действия по направлениям
  // и страницам, не передавая в Метрику контакты или содержимое формы.
  const context = Object.fromEntries(
    Object.entries({
      service: serviceFromPath(),
      page: window.location.pathname,
      ...params,
    }).filter(([, value]) => value !== undefined),
  ) as MetrikaParams
  window.ym?.(loadedId, 'reachGoal', goal, context)
}
