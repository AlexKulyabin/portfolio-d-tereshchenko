import type { FirebaseApp } from 'firebase/app'
import type { Auth } from 'firebase/auth'
import type { Firestore } from 'firebase/firestore'
import type { FirebaseStorage } from 'firebase/storage'

/**
 * Ленивая инициализация Firebase.
 *
 * Модули подключаются через динамический import, поэтому SDK попадает
 * в отдельный чанк и грузится только там, где действительно нужен:
 * в админке и при отправке заявки. Публичные страницы читают контент
 * из статического файла и Firebase не тянут вовсе.
 *
 * Ключи в этом конфиге не являются секретом — доступ ограничивают
 * правила Firestore и Storage, а не их сокрытие.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export function isFirebaseConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)
}

/**
 * Локальные эмуляторы: позволяют разрабатывать и проверять админку,
 * не трогая рабочую базу и не расходуя квоты. Включаются переменной
 * VITE_USE_EMULATORS=true — см. docs/FIREBASE.md.
 */
const useEmulators = import.meta.env.VITE_USE_EMULATORS === 'true'

let appPromise: Promise<FirebaseApp> | null = null

async function getApp(): Promise<FirebaseApp> {
  if (!isFirebaseConfigured()) {
    throw new Error(
      'Firebase не настроен: заполните переменные VITE_FIREBASE_* в файле .env.local (см. docs/FIREBASE.md)',
    )
  }
  appPromise ??= (async () => {
    const { initializeApp, getApps, getApp: getExisting } = await import('firebase/app')
    return getApps().length ? getExisting() : initializeApp(firebaseConfig)
  })()
  return appPromise
}

let authPromise: Promise<Auth> | null = null

export async function getFirebaseAuth(): Promise<Auth> {
  authPromise ??= (async () => {
    const [app, authModule] = await Promise.all([getApp(), import('firebase/auth')])
    const auth = authModule.getAuth(app)

    if (useEmulators) {
      authModule.connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
    }

    await authModule.setPersistence(auth, authModule.browserLocalPersistence)
    return auth
  })()
  return authPromise
}

let dbPromise: Promise<Firestore> | null = null

export async function getDb(): Promise<Firestore> {
  dbPromise ??= (async () => {
    const [app, firestore] = await Promise.all([getApp(), import('firebase/firestore')])
    const db = firestore.getFirestore(app)
    if (useEmulators) firestore.connectFirestoreEmulator(db, '127.0.0.1', 8080)
    return db
  })()
  return dbPromise
}

let storagePromise: Promise<FirebaseStorage> | null = null

export async function getFirebaseStorage(): Promise<FirebaseStorage> {
  storagePromise ??= (async () => {
    const [app, storageModule] = await Promise.all([getApp(), import('firebase/storage')])
    const storage = storageModule.getStorage(app)
    if (useEmulators) storageModule.connectStorageEmulator(storage, '127.0.0.1', 9199)
    return storage
  })()
  return storagePromise
}
