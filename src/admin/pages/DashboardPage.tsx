import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, CheckCircle2, History, Loader2, RotateCcw } from 'lucide-react'
import type { SiteContent } from '@/schemas/content'
import { useDraft, useDraftContent } from '../DraftProvider'
import { loadHistory, restoreVersion, type HistoryEntry } from '../lib/store'
import { PageHeading } from '../components/EditorSection'

/**
 * Проверка готовности сайта к запуску.
 *
 * Заказчику удобнее видеть список того, что осталось заполнить, чем
 * обходить все разделы вручную — особенно перед стартом рекламы, где
 * пустой телефон или отсутствующая цена стоят реальных денег.
 */
type Check = { label: string; ok: boolean; where: string; to: string }

function runChecks(content: SiteContent): Check[] {
  const checks: Check[] = [
    {
      label: 'Указан телефон',
      ok: Boolean(content.settings.contacts.phone && content.settings.contacts.phoneRaw),
      where: 'Контакты и настройки',
      to: '/admin/settings',
    },
    {
      label: 'Указана электронная почта',
      ok: Boolean(content.settings.contacts.email),
      where: 'Контакты и настройки',
      to: '/admin/settings',
    },
    {
      label: 'Заполнены реквизиты (нужны для рекламы)',
      ok: Boolean(content.settings.legal.name && content.settings.legal.inn),
      where: 'Контакты и настройки',
      to: '/admin/settings',
    },
    {
      label: 'Указан адрес сайта',
      ok: Boolean(content.settings.siteUrl && !content.settings.siteUrl.includes('example')),
      where: 'Контакты и настройки',
      to: '/admin/settings',
    },
    {
      label: 'Подключена Яндекс.Метрика',
      ok: Boolean(content.settings.analytics.metrikaId),
      where: 'Контакты и настройки',
      to: '/admin/settings',
    },
    {
      label: 'Загружена фотография эксперта',
      ok: Boolean(content.expert.photo.url),
      where: 'Об эксперте',
      to: '/admin/expert',
    },
  ]

  for (const service of content.services) {
    const pricesFilled = service.packages.length > 0 && service.packages.every((pkg) => pkg.price)
    checks.push({
      label: `Заполнены цены: ${service.shortTitle}`,
      ok: pricesFilled,
      where: service.title,
      to: `/admin/services/${service.slug}`,
    })
  }

  return checks
}

export default function DashboardPage() {
  const [content] = useDraftContent()
  const { publishedInfo, dirty, reload } = useDraft()
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [restoring, setRestoring] = useState<string | null>(null)

  useEffect(() => {
    void loadHistory().then(setHistory).catch(() => setHistory([]))
  }, [publishedInfo?.version])

  const checks = runChecks(content)
  const pending = checks.filter((check) => !check.ok)

  const handleRestore = async (entry: HistoryEntry) => {
    if (!confirm(`Вернуть версию ${entry.version}? Текущий черновик будет заменён.`)) return
    setRestoring(entry.id)
    try {
      await restoreVersion(entry.id)
      await reload()
      alert('Версия загружена в черновик. Проверьте её и нажмите «Опубликовать».')
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Не удалось восстановить версию')
    } finally {
      setRestoring(null)
    }
  }

  return (
    <>
      <PageHeading
        title="Обзор"
        description="Что сделать перед запуском и как обстоят дела с публикацией."
      />

      <section className="mb-6 rounded-2xl bg-white p-6 ring-1 ring-slate-200">
        <h2 className="font-display text-lg font-bold text-slate-900">Готовность сайта</h2>

        {pending.length === 0 ? (
          <p className="mt-4 flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <CheckCircle2 className="size-5 shrink-0" />
            Всё заполнено — сайт готов к запуску рекламы.
          </p>
        ) : (
          <>
            <p className="mt-1.5 text-sm text-slate-500">
              Осталось заполнить {pending.length} из {checks.length} пунктов.
            </p>
            <ul className="mt-5 space-y-2">
              {pending.map((check) => (
                <li key={check.label}>
                  <Link
                    to={check.to}
                    className="flex items-center gap-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 transition-colors hover:bg-amber-100"
                  >
                    <AlertCircle className="size-5 shrink-0 text-amber-600" />
                    <span className="flex-1">{check.label}</span>
                    <span className="text-xs text-amber-700">{check.where} →</span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}

        {checks.some((check) => check.ok) && (
          <ul className="mt-4 space-y-1.5">
            {checks
              .filter((check) => check.ok)
              .map((check) => (
                <li key={check.label} className="flex items-center gap-3 px-1 text-sm text-slate-500">
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                  {check.label}
                </li>
              ))}
          </ul>
        )}
      </section>

      <section className="mb-6 rounded-2xl bg-white p-6 ring-1 ring-slate-200">
        <h2 className="font-display text-lg font-bold text-slate-900">Публикация</h2>
        <div className="mt-4 space-y-2 text-sm text-slate-600">
          {publishedInfo ? (
            <p>
              Последняя публикация: версия {publishedInfo.version} от{' '}
              {new Date(publishedInfo.publishedAt).toLocaleString('ru-RU')}.
            </p>
          ) : (
            <p>Сайт ещё ни разу не публиковался из админки.</p>
          )}
          <p className={dirty ? 'text-amber-700' : 'text-emerald-700'}>
            {dirty
              ? 'Есть изменения, которых пока нет на сайте. Нажмите «Опубликовать» в верхней панели.'
              : 'Черновик совпадает с тем, что опубликовано.'}
          </p>
        </div>

        <div className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-500">
          Как это работает: «Сохранить» записывает черновик — посетители его не видят.
          «Опубликовать» отправляет изменения на сайт, они появляются сразу. Поисковые системы
          увидят новый текст после следующей пересборки сайта.
        </div>
      </section>

      {history.length > 0 && (
        <section className="rounded-2xl bg-white p-6 ring-1 ring-slate-200">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-slate-900">
            <History className="size-5 text-slate-400" />
            Предыдущие версии
          </h2>
          <p className="mt-1.5 text-sm text-slate-500">
            Если что-то пошло не так, можно вернуть один из прошлых вариантов.
          </p>

          <ul className="mt-5 divide-y divide-slate-100">
            {history.map((entry) => (
              <li key={entry.id} className="flex items-center justify-between gap-4 py-3">
                <div className="text-sm">
                  <p className="font-medium text-slate-800">Версия {entry.version}</p>
                  {entry.publishedAt && (
                    <p className="text-slate-400">
                      {new Date(entry.publishedAt).toLocaleString('ru-RU')}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleRestore(entry)}
                  disabled={restoring !== null}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-50"
                >
                  {restoring === entry.id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <RotateCcw className="size-4" />
                  )}
                  Вернуть
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}
