import { useState, type ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  CloudUpload,
  ExternalLink,
  FileText,
  Home,
  Inbox,
  KeyRound,
  Loader2,
  LogOut,
  Save,
  Settings,
  UserRound,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { sortedServices } from '@/lib/content'
import { useAuth } from './AuthProvider'
import { useDraft } from './DraftProvider'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
    isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900',
  )

export function AdminShell({ children }: { children: ReactNode }) {
  const { signOut } = useAuth()
  const { content, loading, error, dirty, saving, publishing, publishedInfo, save, publishNow } =
    useDraft()
  const navigate = useNavigate()
  const [notice, setNotice] = useState<string | null>(null)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <Loader2 className="mx-auto size-8 animate-spin text-slate-400" />
          <p className="mt-4 text-sm text-slate-500">Загружаю контент…</p>
        </div>
      </div>
    )
  }

  if (error && !content) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-5">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center ring-1 ring-slate-200">
          <p className="font-medium text-red-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white"
          >
            Обновить страницу
          </button>
        </div>
      </div>
    )
  }

  const services = content ? sortedServices(content) : []

  const handleSave = async () => {
    try {
      await save()
      setNotice('Черновик сохранён')
      setTimeout(() => setNotice(null), 3000)
    } catch {
      // Текст ошибки уже показан в шапке.
    }
  }

  const handlePublish = async () => {
    if (!confirm('Опубликовать изменения? Они сразу появятся на сайте.')) return
    try {
      await publishNow()
      setNotice('Опубликовано — изменения уже на сайте')
      setTimeout(() => setNotice(null), 5000)
    } catch {
      // Текст ошибки уже показан в шапке.
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-5 py-3">
          <p className="font-display text-base font-bold text-slate-900">Управление сайтом</p>

          {dirty && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
              Есть несохранённые изменения
            </span>
          )}
          {notice && (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
              {notice}
            </span>
          )}
          {error && (
            <span className="truncate rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
              {error}
            </span>
          )}

          <div className="ml-auto flex items-center gap-2">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 sm:flex"
            >
              <ExternalLink className="size-4" />
              Открыть сайт
            </a>

            <button
              onClick={handleSave}
              disabled={saving || !dirty}
              className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-800 ring-1 ring-slate-300 transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              Сохранить
            </button>

            <button
              onClick={handlePublish}
              disabled={publishing}
              className="flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:opacity-60"
            >
              {publishing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CloudUpload className="size-4" />
              )}
              Опубликовать
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-8 px-5 py-8">
        <aside className="hidden w-60 shrink-0 lg:block">
          <nav className="sticky top-24 space-y-1">
            <NavLink to="/admin" end className={linkClass}>
              <Home className="size-4" />
              Обзор
            </NavLink>
            <NavLink to="/admin/home" className={linkClass}>
              <FileText className="size-4" />
              Главная страница
            </NavLink>

            <p className="px-3 pt-5 pb-2 text-xs font-semibold tracking-wide text-slate-400 uppercase">
              Услуги
            </p>
            {services.map((service) => (
              <NavLink key={service.slug} to={`/admin/services/${service.slug}`} className={linkClass}>
                <span className="size-4 shrink-0 rounded bg-blue-100" aria-hidden="true" />
                <span className="truncate">{service.shortTitle}</span>
              </NavLink>
            ))}

            <p className="px-3 pt-5 pb-2 text-xs font-semibold tracking-wide text-slate-400 uppercase">
              Прочее
            </p>
            <NavLink to="/admin/expert" className={linkClass}>
              <UserRound className="size-4" />
              Об эксперте
            </NavLink>
            <NavLink to="/admin/settings" className={linkClass}>
              <Settings className="size-4" />
              Контакты и настройки
            </NavLink>
            <NavLink to="/admin/leads" className={linkClass}>
              <Inbox className="size-4" />
              Заявки
            </NavLink>
            <NavLink to="/admin/access" className={linkClass}>
              <KeyRound className="size-4" />
              Пароль
            </NavLink>

            <button
              onClick={async () => {
                if (dirty && !confirm('Есть несохранённые изменения. Всё равно выйти?')) return
                await signOut()
                navigate('/admin')
              }}
              className="mt-5 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="size-4" />
              Выйти
            </button>

            {publishedInfo && (
              <p className="px-3 pt-4 text-xs text-slate-400">
                Версия {publishedInfo.version}
                {publishedInfo.publishedAt && (
                  <>
                    <br />
                    от {new Date(publishedInfo.publishedAt).toLocaleString('ru-RU')}
                  </>
                )}
              </p>
            )}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 pb-16">{children}</main>
      </div>

      {/* Мобильная навигация: на телефоне заказчик правит текст и цены */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-slate-200 bg-white lg:hidden">
        {[
          { to: '/admin', icon: Home, label: 'Обзор', end: true },
          { to: '/admin/home', icon: FileText, label: 'Главная' },
          { to: '/admin/settings', icon: Settings, label: 'Контакты' },
          { to: '/admin/leads', icon: Inbox, label: 'Заявки' },
          { to: '/admin/access', icon: KeyRound, label: 'Пароль' },
        ].map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center gap-1 py-3 text-xs',
                isActive ? 'text-blue-700' : 'text-slate-500',
              )
            }
          >
            <item.icon className="size-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
