import { useEffect, useState } from 'react'
import { Download, Inbox, Loader2, Mail, Phone, RefreshCw, Trash2 } from 'lucide-react'
import { getDb } from '@/lib/firebase'
import { cn } from '@/lib/utils'
import { PageHeading } from '../components/EditorSection'

type Lead = {
  id: string
  name: string
  phone: string
  email: string
  service: string
  message: string
  status: string
  createdAt: Date | null
  page: string
}

async function loadLeads(): Promise<Lead[]> {
  const [db, { collection, getDocs, limit, orderBy, query }] = await Promise.all([
    getDb(),
    import('firebase/firestore'),
  ])
  const snapshot = await getDocs(
    query(collection(db, 'leads'), orderBy('createdAt', 'desc'), limit(200)),
  )

  return snapshot.docs.map((entry) => {
    const data = entry.data()
    return {
      id: entry.id,
      name: (data.name as string) ?? '',
      phone: (data.phone as string) ?? '',
      email: (data.email as string) ?? '',
      service: (data.service as string) ?? '',
      message: (data.message as string) ?? '',
      status: (data.status as string) ?? 'new',
      createdAt: data.createdAt?.toDate?.() ?? null,
      page: (data.page as string) ?? '',
    }
  })
}

function toCsv(leads: Lead[]): string {
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`
  const header = ['Дата', 'Имя', 'Телефон', 'Почта', 'Услуга', 'Комментарий', 'Страница']

  const rows = leads.map((lead) =>
    [
      lead.createdAt ? lead.createdAt.toLocaleString('ru-RU') : '',
      lead.name,
      lead.phone,
      lead.email,
      lead.service,
      lead.message,
      lead.page,
    ]
      .map(escape)
      .join(';'),
  )

  // Метка кодировки нужна, чтобы Excel открыл кириллицу без искажений.
  return `﻿${[header.map(escape).join(';'), ...rows].join('\n')}`
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const refresh = async () => {
    setLoading(true)
    setError(null)
    try {
      setLeads(await loadLeads())
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Не удалось загрузить заявки')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  const download = () => {
    const blob = new Blob([toCsv(leads)], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Заявки-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const removeLead = async (lead: Lead) => {
    if (!confirm(`Удалить заявку от ${lead.name || 'посетителя'}? Действие нельзя отменить.`)) return
    setDeletingId(lead.id)
    setError(null)
    try {
      const [db, { deleteDoc, doc }] = await Promise.all([getDb(), import('firebase/firestore')])
      await deleteDoc(doc(db, 'leads', lead.id))
      setLeads((current) => current.filter((item) => item.id !== lead.id))
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Не удалось удалить заявку')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <PageHeading
        title="Заявки"
        description="Обращения с формы обратной связи. Показаны последние 200. Неактуальные заявки удаляются автоматически через 180 дней; удалить обращение раньше можно вручную."
      />

      <div className="mb-5 flex gap-3">
        <button
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-300 transition-colors hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw className={cn('size-4', loading && 'animate-spin')} />
          Обновить
        </button>
        {leads.length > 0 && (
          <button
            onClick={download}
            className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-300 transition-colors hover:bg-slate-50"
          >
            <Download className="size-4" />
            Скачать таблицу
          </button>
        )}
      </div>

      {error && (
        <p className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-7 animate-spin text-slate-400" />
        </div>
      ) : leads.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center ring-1 ring-slate-200">
          <Inbox className="mx-auto size-10 text-slate-300" />
          <p className="mt-4 font-medium text-slate-700">Заявок пока нет</p>
          <p className="mt-1 text-sm text-slate-500">
            Здесь появятся обращения с формы обратной связи.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {leads.map((lead) => (
            <li key={lead.id} className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-base font-bold text-slate-900">{lead.name}</p>
                  {lead.service && <p className="mt-0.5 text-sm text-blue-700">{lead.service}</p>}
                </div>
                <p className="text-sm text-slate-400">
                  {lead.createdAt ? lead.createdAt.toLocaleString('ru-RU') : ''}
                </p>
                <button
                  type="button"
                  onClick={() => void removeLead(lead)}
                  disabled={deletingId === lead.id}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 disabled:opacity-60"
                >
                  {deletingId === lead.id ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                  Удалить
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                {lead.phone && (
                  <a
                    href={`tel:${lead.phone.replace(/[^\d+]/g, '')}`}
                    className="flex items-center gap-2 font-medium text-slate-900 hover:text-blue-700"
                  >
                    <Phone className="size-4 text-slate-400" />
                    {lead.phone}
                  </a>
                )}
                {lead.email && (
                  <a
                    href={`mailto:${lead.email}`}
                    className="flex items-center gap-2 text-slate-700 hover:text-blue-700"
                  >
                    <Mail className="size-4 text-slate-400" />
                    {lead.email}
                  </a>
                )}
              </div>

              {lead.message && (
                <p className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  {lead.message}
                </p>
              )}

              {lead.page && (
                <p className="mt-3 text-xs text-slate-400">
                  Страница: {lead.page}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
