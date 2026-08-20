import { useState, type FormEvent } from 'react'
import { KeyRound, Loader2 } from 'lucide-react'
import { useAuth } from '../AuthProvider'
import { EditorSection, PageHeading } from '../components/EditorSection'

const inputClass =
  'mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-[0.95rem] outline-none ' +
  'transition-colors focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10'

function PasswordField({
  label,
  value,
  autoComplete,
  onChange,
}: {
  label: string
  value: string
  autoComplete: string
  onChange: (value: string) => void
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        type="password"
        value={value}
        autoComplete={autoComplete}
        minLength={12}
        required
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
      />
    </label>
  )
}

export default function AccessPage() {
  const { user, changePassword } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPasswordRepeat, setNewPasswordRepeat] = useState('')
  const [passwordBusy, setPasswordBusy] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const submitPassword = async (event: FormEvent) => {
    event.preventDefault()
    setPasswordError(null)
    setPasswordMessage(null)
    if (newPassword !== newPasswordRepeat) {
      setPasswordError('Новые пароли не совпадают')
      return
    }

    setPasswordBusy(true)
    try {
      await changePassword(currentPassword, newPassword)
      setCurrentPassword('')
      setNewPassword('')
      setNewPasswordRepeat('')
      setPasswordMessage('Пароль изменён')
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : 'Не удалось изменить пароль')
    } finally {
      setPasswordBusy(false)
    }
  }

  return (
    <>
      <PageHeading
        title="Пароль"
        description="Здесь можно изменить пароль текущей учётной записи. Новые учётные записи создаются только в Firebase Authentication."
      />

      <EditorSection
        title="Мой пароль"
        description={`Учётная запись: ${user?.email ?? '—'}. Для защиты нужно подтвердить текущий пароль.`}
      >
        <form onSubmit={submitPassword} className="max-w-lg space-y-4">
          <PasswordField
            label="Текущий пароль"
            value={currentPassword}
            autoComplete="current-password"
            onChange={setCurrentPassword}
          />
          <PasswordField
            label="Новый пароль"
            value={newPassword}
            autoComplete="new-password"
            onChange={setNewPassword}
          />
          <PasswordField
            label="Повторите новый пароль"
            value={newPasswordRepeat}
            autoComplete="new-password"
            onChange={setNewPasswordRepeat}
          />
          <p className="text-xs text-slate-500">Минимум 12 символов. Не используйте пароль от почты.</p>
          {passwordError && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{passwordError}</p>}
          {passwordMessage && <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{passwordMessage}</p>}
          <button
            type="submit"
            disabled={passwordBusy}
            className="flex h-11 items-center gap-2 rounded-lg bg-slate-900 px-4 font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-60"
          >
            {passwordBusy ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
            {passwordBusy ? 'Изменяю…' : 'Изменить пароль'}
          </button>
        </form>
      </EditorSection>
    </>
  )
}
