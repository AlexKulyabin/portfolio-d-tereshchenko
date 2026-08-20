/**
 * Яндекс.Метрика.
 *
 * Счётчик подключается после того, как страница стала интерактивной:
 * на LCP он влиять не должен. Номер счётчика приходит из контента,
 * поэтому заказчик может поменять его в админке без пересборки.
 */

let loadedId: number | null = null

/** Цели, которые настраиваются в интерфейсе Метрики с этими же именами. */
export type MetrikaGoal =
  | 'form_submit'
  | 'click_phone'
  | 'click_email'
  | 'click_whatsapp'
  | 'click_telegram'

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

export function trackGoal(goal: MetrikaGoal, params?: Record<string, unknown>): void {
  if (loadedId) window.ym?.(loadedId, 'reachGoal', goal, params)
}
