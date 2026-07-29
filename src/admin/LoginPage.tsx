import { useState } from 'react'
import { Loader2, LockKeyhole } from 'lucide-react'
import { useAuth } from './AuthProvider'

export function LoginPage() {
  const { signIn, error: authError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setBusy(true)
    try {
      await signIn(email.trim(), password)
    } catch (signInError) {
      setError(signInError instanceof Error ? signInError.message : 'Не удалось войти')
    } finally {
      setBusy(false)
    }
  }

  const inputClass =
    'w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-[0.95rem] outline-none ' +
    'transition-colors focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10'

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-5">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <div className="mb-6 flex size-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <LockKeyhole className="size-6" />
          </div>

          <h1 className="font-display text-xl font-bold text-slate-900">Управление сайтом</h1>
          <p className="mt-2 text-sm text-slate-500">
            Войдите, чтобы редактировать содержимое страниц.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Почта</span>
              <input
                type="email"
                value={email}
                autoComplete="username"
                required
                onChange={(event) => setEmail(event.target.value)}
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Пароль</span>
              <input
                type="password"
                value={password}
                autoComplete="current-password"
                required
                onChange={(event) => setPassword(event.target.value)}
                className={inputClass}
              />
            </label>

            {(error ?? authError) && (
              <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {error ?? authError}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-900 font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-60"
            >
              {busy && <Loader2 className="size-4 animate-spin" />}
              {busy ? 'Вхожу…' : 'Войти'}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-xs text-slate-400">
          Забыли пароль? Его можно сбросить в консоли Firebase.
        </p>
      </div>
    </div>
  )
}
