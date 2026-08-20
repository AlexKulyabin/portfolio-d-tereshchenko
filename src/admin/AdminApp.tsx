import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Loader2, ShieldAlert } from 'lucide-react'
import { useHead } from '@/lib/head'
import { AuthProvider, useAuth } from './AuthProvider'
import { DraftProvider } from './DraftProvider'
import { LoginPage } from './LoginPage'
import { AdminShell } from './AdminShell'

const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const HomeEditor = lazy(() => import('./pages/HomeEditor'))
const ServiceEditor = lazy(() => import('./pages/ServiceEditor'))
const ExpertEditor = lazy(() => import('./pages/ExpertEditor'))
const SettingsEditor = lazy(() => import('./pages/SettingsEditor'))
const LeadsPage = lazy(() => import('./pages/LeadsPage'))
const AccessPage = lazy(() => import('./pages/AccessPage'))

function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <Loader2 className="size-8 animate-spin text-slate-400" />
    </div>
  )
}

function AdminRoutes() {
  const { user, isAdmin, loading, signOut } = useAuth()

  if (loading) return <Loading />
  if (!user) return <LoginPage />
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-5">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center ring-1 ring-slate-200">
          <ShieldAlert className="mx-auto size-10 text-amber-500" />
          <h1 className="mt-4 font-display text-xl font-bold text-slate-900">Нет доступа к админке</h1>
          <p className="mt-2 text-sm text-slate-500">
            Для {user.email ?? 'этой учётной записи'} не выданы права редактора. Проверьте пользователя и метку admin в Firebase Authentication.
          </p>
          <button
            onClick={() => void signOut()}
            className="mt-6 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white"
          >
            Выйти
          </button>
        </div>
      </div>
    )
  }

  return (
    <DraftProvider>
      <AdminShell>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route index element={<DashboardPage />} />
            <Route path="home" element={<HomeEditor />} />
            <Route path="services/:slug" element={<ServiceEditor />} />
            <Route path="expert" element={<ExpertEditor />} />
            <Route path="settings" element={<SettingsEditor />} />
            <Route path="leads" element={<LeadsPage />} />
            <Route path="access" element={<AccessPage />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </Suspense>
      </AdminShell>
    </DraftProvider>
  )
}

export default function AdminApp() {
  // Админку индексировать незачем.
  useHead({
    title: 'Управление сайтом',
    meta: [{ name: 'robots', content: 'noindex, nofollow' }],
    jsonLd: [],
  })

  return (
    <AuthProvider>
      <AdminRoutes />
    </AuthProvider>
  )
}
