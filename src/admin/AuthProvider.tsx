import { createContext, use, useEffect, useState, type ReactNode } from 'react'
import type { User } from 'firebase/auth'
import { getFirebaseAuth, isFirebaseConfigured } from '@/lib/firebase'

type AuthState = {
  user: User | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

/** Сообщения Firebase на английском — переводим в понятные пользователю. */
function describeAuthError(code: string): string {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Неверная почта или пароль'
    case 'auth/too-many-requests':
      return 'Слишком много попыток входа. Подождите несколько минут'
    case 'auth/network-request-failed':
      return 'Нет связи с сервером. Проверьте интернет'
    case 'auth/invalid-email':
      return 'Проверьте адрес почты'
    default:
      return 'Не удалось войти. Попробуйте ещё раз'
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setError('Firebase не настроен. Заполните файл .env.local — см. docs/FIREBASE.md')
      setLoading(false)
      return
    }

    let unsubscribe: (() => void) | undefined
    let cancelled = false

    void (async () => {
      try {
        const [auth, { onAuthStateChanged }] = await Promise.all([
          getFirebaseAuth(),
          import('firebase/auth'),
        ])
        if (cancelled) return
        unsubscribe = onAuthStateChanged(auth, (nextUser) => {
          setUser(nextUser)
          setLoading(false)
        })
      } catch (initError) {
        if (cancelled) return
        setError(initError instanceof Error ? initError.message : 'Ошибка инициализации')
        setLoading(false)
      }
    })()

    return () => {
      cancelled = true
      unsubscribe?.()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    setError(null)
    const [auth, { signInWithEmailAndPassword }] = await Promise.all([
      getFirebaseAuth(),
      import('firebase/auth'),
    ])
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (signInError) {
      const code = (signInError as { code?: string }).code ?? ''
      throw new Error(describeAuthError(code))
    }
  }

  const signOut = async () => {
    const [auth, { signOut: firebaseSignOut }] = await Promise.all([
      getFirebaseAuth(),
      import('firebase/auth'),
    ])
    await firebaseSignOut(auth)
  }

  return <AuthContext value={{ user, loading, error, signIn, signOut }}>{children}</AuthContext>
}

export function useAuth(): AuthState {
  const context = use(AuthContext)
  if (!context) throw new Error('useAuth используется вне AuthProvider')
  return context
}
