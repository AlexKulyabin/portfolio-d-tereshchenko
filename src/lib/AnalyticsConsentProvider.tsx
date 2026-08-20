import { createContext, use, useEffect, useState, type ReactNode } from 'react'

export type AnalyticsConsent = 'unknown' | 'accepted' | 'rejected'

type AnalyticsConsentState = {
  consent: AnalyticsConsent
  setConsent: (consent: Exclude<AnalyticsConsent, 'unknown'>) => void
  openPreferences: () => void
}

const STORAGE_KEY = 'expert-auditor-analytics-consent-v1'
const AnalyticsConsentContext = createContext<AnalyticsConsentState | null>(null)

export function AnalyticsConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsentState] = useState<AnalyticsConsent>('unknown')

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      setConsentState(saved === 'accepted' || saved === 'rejected' ? saved : 'unknown')
    } catch {
      setConsentState('unknown')
    }
  }, [])

  const setConsent = (next: Exclude<AnalyticsConsent, 'unknown'>) => {
    setConsentState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // В приватном режиме выбор действует до закрытия вкладки.
    }
  }

  const openPreferences = () => {
    setConsentState('unknown')
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Невозможность записать настройку не должна мешать посетителю отказаться.
    }
  }

  return (
    <AnalyticsConsentContext value={{ consent, setConsent, openPreferences }}>
      {children}
    </AnalyticsConsentContext>
  )
}

export function useAnalyticsConsent(): AnalyticsConsentState {
  const context = use(AnalyticsConsentContext)
  if (!context) throw new Error('useAnalyticsConsent используется вне AnalyticsConsentProvider')
  return context
}
