import { lazy, Suspense } from 'react'
import type { RouteObject } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import HomePage from '@/pages/HomePage'
import ContactsPage from '@/pages/ContactsPage'
import PrivacyPage from '@/pages/PrivacyPage'
import ConsentPage from '@/pages/ConsentPage'
import ServicePage from '@/pages/ServicePage'
import NotFoundPage from '@/pages/NotFoundPage'
import { SERVICE_SLUGS } from '@/schemas/content'

/**
 * Публичные страницы подключаются напрямую: их шесть, они небольшие, и
 * пререндеру нужен синхронный доступ к компонентам.
 *
 * Админка — наоборот, отложенной загрузкой: её код и Firebase SDK
 * посетителям сайта не нужны, а весят они больше, чем весь публичный сайт.
 */
const AdminApp = lazy(() => import('@/admin/AdminApp'))

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'kontakty', element: <ContactsPage /> },
      { path: 'politika-konfidencialnosti', element: <PrivacyPage /> },
      { path: 'soglasie-na-obrabotku-dannyh', element: <ConsentPage /> },
      { path: ':slug', element: <ServicePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    path: '/admin/*',
    element: (
      <Suspense fallback={null}>
        <AdminApp />
      </Suspense>
    ),
  },
]

/** Адреса, которые пререндер превращает в готовые HTML-файлы. */
export const staticPaths: string[] = [
  '/',
  ...SERVICE_SLUGS.map((slug) => `/${slug}`),
  '/kontakty',
  '/politika-konfidencialnosti',
  '/soglasie-na-obrabotku-dannyh',
  '/404',
]
