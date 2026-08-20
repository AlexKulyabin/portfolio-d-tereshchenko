import { createContext, use, useEffect, useState, type ReactNode } from 'react'
import type { User } from 'firebase/auth'
import { getFirebaseAuth, isFirebaseConfigured } from '@/lib/firebase'

type AuthState = {
  user: User | null
  isAdmin: boolean
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  sendPasswordReset: (email: string) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
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
    case 'auth/requires-recent-login':
      return 'Для смены пароля подтвердите текущий пароль ещё раз'
    case 'auth/weak-password':
      return 'Выберите более надёжный пароль'
    case 'auth/user-not-found':
      return 'Учётная запись не найдена'
    default:
      return 'Операцию не удалось выполнить. Попробуйте ещё раз'
  }
}

function assertPassword(password: string) {
  if (password.length < 12) {
    throw new Error('Пароль должен содержать не менее 12 символов')
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
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
        unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
          setLoading(true)
          setError(null)

          if (!nextUser) {
            setUser(null)
            setIsAdmin(false)
            setLoading(false)
            return
          }

          try {
            const token = await nextUser.getIdTokenResult()
            if (cancelled) return
            setUser(nextUser)
            setIsAdmin(token.claims.admin === true)
          } catch (tokenError) {
            if (cancelled) return
            setUser(nextUser)
            setIsAdmin(false)
            setError(tokenError instanceof Error ? tokenError.message : 'Не удалось проверить права доступа')
          } finally {
            if (!cancelled) setLoading(false)
          }
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

  const sendPasswordReset = async (email: string) => {
    const [auth, { sendPasswordResetEmail }] = await Promise.all([
      getFirebaseAuth(),
      import('firebase/auth'),
    ])
    try {
      auth.languageCode = 'ru'
      await sendPasswordResetEmail(auth, email.trim())
    } catch (resetError) {
      const code = (resetError as { code?: string }).code ?? ''
      // Не раскрываем, зарегистрирован ли конкретный адрес в админке.
      if (code === 'auth/user-not-found') return
      throw new Error(describeAuthError(code))
    }
  }

  const changePassword = async (currentPassword: string, newPassword: string) => {
    assertPassword(newPassword)
    const [auth, { EmailAuthProvider, reauthenticateWithCredential, updatePassword }] = await Promise.all([
      getFirebaseAuth(),
      import('firebase/auth'),
    ])
    const currentUser = auth.currentUser
    if (!currentUser?.email) throw new Error('Войдите в учётную запись заново')

    try {
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword)
      await reauthenticateWithCredential(currentUser, credential)
      await updatePassword(currentUser, newPassword)
    } catch (passwordError) {
      const code = (passwordError as { code?: string }).code ?? ''
      throw new Error(describeAuthError(code))
    }
  }

  return (
    <AuthContext
      value={{
        user,
        isAdmin,
        loading,
        error,
        signIn,
        signOut,
        sendPasswordReset,
        changePassword,
      }}
    >
      {children}
    </AuthContext>
  )
}

export function useAuth(): AuthState {
  const context = use(AuthContext)
  if (!context) throw new Error('useAuth используется вне AuthProvider')
  return context
}
