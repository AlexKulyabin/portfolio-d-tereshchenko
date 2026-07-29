import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { HeadProvider } from './lib/head'
import { routes } from './routes'
import './styles/index.css'

const container = document.getElementById('root')
if (!container) throw new Error('Не найден корневой элемент #root')

const app = (
  <StrictMode>
    <HeadProvider collector={null}>
      <RouterProvider router={createBrowserRouter(routes)} />
    </HeadProvider>
  </StrictMode>
)

// Страницы приходят с сервера уже отрисованными, поэтому обычно
// подключаемся к готовой разметке. Пустой контейнер бывает только на
// адресах вне пререндера — например, в админке.
if (container.hasChildNodes()) {
  hydrateRoot(container, app)
} else {
  createRoot(container).render(app)
}
