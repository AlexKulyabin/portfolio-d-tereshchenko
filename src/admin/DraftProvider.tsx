import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { siteContentSchema, type SiteContent } from '@/schemas/content'
import { loadDraft, loadPublishedInfo, publish, saveDraft, type PublishedInfo } from './lib/store'

type DraftState = {
  content: SiteContent | null
  loading: boolean
  error: string | null
  dirty: boolean
  saving: boolean
  publishing: boolean
  publishedInfo: PublishedInfo
  update: (updater: (content: SiteContent) => SiteContent) => void
  save: () => Promise<void>
  publishNow: () => Promise<void>
  reload: () => Promise<void>
}

const DraftContext = createContext<DraftState | null>(null)

export function DraftProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [publishedInfo, setPublishedInfo] = useState<PublishedInfo>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [draft, info] = await Promise.all([loadDraft(), loadPublishedInfo()])
      setContent(draft)
      setPublishedInfo(info)
      setDirty(false)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Не удалось загрузить контент')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  // Уйти со страницы с несохранёнными правками — самый обидный способ
  // потерять полчаса работы, поэтому переспрашиваем.
  useEffect(() => {
    if (!dirty) return
    const handler = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])

  const update = useCallback((updater: (content: SiteContent) => SiteContent) => {
    setContent((current) => (current ? updater(current) : current))
    setDirty(true)
  }, [])

  const save = useCallback(async () => {
    if (!content) return
    setSaving(true)
    setError(null)
    try {
      await saveDraft(content)
      setDirty(false)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Не удалось сохранить')
      throw saveError
    } finally {
      setSaving(false)
    }
  }, [content])

  const publishNow = useCallback(async () => {
    if (!content) return
    setPublishing(true)
    setError(null)
    try {
      // Публикуем только то, что проходит проверку схемы: испорченный
      // контент не должен доехать до сайта.
      const parsed = siteContentSchema.safeParse(content)
      if (!parsed.success) {
        const issue = parsed.error.issues[0]
        throw new Error(
          `Проверьте заполнение: ${issue?.message ?? 'есть незаполненные обязательные поля'}`,
        )
      }

      const published = await publish(parsed.data)
      setContent(published)
      setPublishedInfo({ version: published.version, publishedAt: published.publishedAt })
      setDirty(false)
    } catch (publishError) {
      setError(publishError instanceof Error ? publishError.message : 'Не удалось опубликовать')
      throw publishError
    } finally {
      setPublishing(false)
    }
  }, [content])

  const value = useMemo<DraftState>(
    () => ({
      content,
      loading,
      error,
      dirty,
      saving,
      publishing,
      publishedInfo,
      update,
      save,
      publishNow,
      reload,
    }),
    [content, loading, error, dirty, saving, publishing, publishedInfo, update, save, publishNow, reload],
  )

  return <DraftContext value={value}>{children}</DraftContext>
}

export function useDraft(): DraftState {
  const context = use(DraftContext)
  if (!context) throw new Error('useDraft используется вне DraftProvider')
  return context
}

/**
 * Удобный доступ к загруженному контенту в редакторах: там он гарантированно
 * есть, потому что оболочка не отрисует их до окончания загрузки.
 */
export function useDraftContent(): [SiteContent, DraftState['update']] {
  const { content, update } = useDraft()
  if (!content) throw new Error('Контент ещё не загружен')
  return [content, update]
}
