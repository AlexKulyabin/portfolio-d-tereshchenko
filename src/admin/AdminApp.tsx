import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
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

function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <Loader2 className="size-8 animate-spin text-slate-400" />
    </div>
  )
}

function AdminRoutes() {
  const { user, loading } = useAuth()

  if (loading) return <Loading />
  if (!user) return <LoginPage />

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
