/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_APP_ID: string
  readonly VITE_SITE_URL: string
  readonly VITE_USE_EMULATORS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

/** Счётчик Яндекс.Метрики, подключается в рантайме. */
interface Window {
  ym?: (id: number, action: string, ...args: unknown[]) => void
}
