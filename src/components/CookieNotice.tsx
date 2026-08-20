import { Link } from 'react-router-dom'
import { useAnalyticsConsent } from '@/lib/AnalyticsConsentProvider'

/** Метрика не загружается, пока посетитель явно не выберет вариант. */
export function CookieNotice() {
  const { consent, setConsent } = useAnalyticsConsent()
  if (consent !== 'unknown') return null

  return (
    <aside
      aria-label="Настройки файлов cookie"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-2xl rounded-2xl border border-line bg-white p-5 shadow-xl sm:inset-x-6 sm:p-6"
    >
      <p className="font-display text-base font-bold text-navy-900">Настройки аналитики</p>
      <p className="mt-2 text-sm leading-relaxed text-ink-600">
        Сайт может использовать Яндекс.Метрику и cookie для статистики посещений. Вы можете
        разрешить или запретить аналитические cookie — это не повлияет на работу формы заявки.
        Подробнее — в{' '}
        <Link to="/politika-konfidencialnosti" className="text-brand-700 underline underline-offset-2">
          политике обработки персональных данных
        </Link>
        .
      </p>
      <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => setConsent('rejected')}
          className="rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-surface"
        >
          Отказаться от аналитики
        </button>
        <button
          type="button"
          onClick={() => setConsent('accepted')}
          className="rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-800"
        >
          Разрешить аналитику
        </button>
      </div>
    </aside>
  )
}
