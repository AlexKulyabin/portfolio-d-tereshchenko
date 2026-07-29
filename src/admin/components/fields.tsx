import { useId, useRef, useState, type ReactNode } from 'react'
import { ChevronDown, ChevronUp, ImageUp, Loader2, Plus, Trash2, X } from 'lucide-react'
import type { ImageValue } from '@/schemas/content'
import { ICON_OPTIONS, getIcon } from '@/lib/icons'
import { cn } from '@/lib/utils'
import { formatBytes, uploadImage } from '../lib/upload'

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-[0.95rem] text-slate-900 ' +
  'outline-none transition-colors placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10'

export function Field({
  label,
  hint,
  children,
  required,
}: {
  label: string
  hint?: string
  children: ReactNode
  required?: boolean
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-1 text-blue-600">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-slate-500">{hint}</span>}
    </label>
  )
}

export function TextInput({
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className={inputClass}
    />
  )
}

export function TextArea({
  value,
  onChange,
  rows = 4,
  placeholder,
  hint,
}: {
  value: string
  onChange: (value: string) => void
  rows?: number
  placeholder?: string
  hint?: string
}) {
  return (
    <>
      <textarea
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={cn(inputClass, 'resize-y leading-relaxed')}
      />
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </>
  )
}

export function Select({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
}) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)} className={inputClass}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

export function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
}) {
  return (
    <label className="flex items-center gap-3 text-sm text-slate-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600/30"
      />
      {label}
    </label>
  )
}

export function IconSelect({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const Icon = getIcon(value)
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
        <Icon className="size-5" />
      </span>
      <Select value={value} onChange={onChange} options={ICON_OPTIONS} />
    </div>
  )
}

/** Список строк: преимущества пакета, перечень документов и т. п. */
export function StringList({
  value,
  onChange,
  placeholder,
  addLabel = 'Добавить пункт',
}: {
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  addLabel?: string
}) {
  return (
    <div className="space-y-2">
      {value.map((item, index) => (
        <div key={index} className="flex gap-2">
          <input
            value={item}
            placeholder={placeholder}
            onChange={(event) => {
              const next = [...value]
              next[index] = event.target.value
              onChange(next)
            }}
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => onChange(value.filter((_, i) => i !== index))}
            aria-label={`Удалить пункт ${index + 1}`}
            className="flex size-11 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...value, ''])}
        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-50"
      >
        <Plus className="size-4" />
        {addLabel}
      </button>
    </div>
  )
}

/**
 * Список повторяемых блоков с возможностью добавить, удалить и
 * переставить элемент. Порядок в интерфейсе совпадает с порядком
 * на сайте — это самый понятный для заказчика вариант.
 */
export function RepeatableList<T>({
  items,
  onChange,
  create,
  renderItem,
  titleOf,
  addLabel,
  max,
}: {
  items: T[]
  onChange: (items: T[]) => void
  create: () => T
  renderItem: (item: T, update: (patch: Partial<T>) => void, index: number) => ReactNode
  titleOf: (item: T, index: number) => string
  addLabel: string
  max?: number
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return
    const next = [...items]
    const [moved] = next.splice(from, 1)
    if (moved !== undefined) next.splice(to, 0, moved)
    onChange(next)
    setOpenIndex(to)
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const isOpen = openIndex === index
        return (
          <div key={index} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center gap-2 bg-slate-50 px-4 py-3">
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex flex-1 items-center gap-3 text-left"
                aria-expanded={isOpen}
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-white text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
                  {index + 1}
                </span>
                <span className="truncate text-sm font-medium text-slate-800">
                  {titleOf(item, index) || 'Без названия'}
                </span>
                <ChevronDown
                  className={cn(
                    'ml-auto size-4 shrink-0 text-slate-400 transition-transform',
                    isOpen && 'rotate-180',
                  )}
                />
              </button>

              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => move(index, index - 1)}
                  disabled={index === 0}
                  aria-label="Переместить выше"
                  className="flex size-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-white hover:text-slate-700 disabled:opacity-30"
                >
                  <ChevronUp className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, index + 1)}
                  disabled={index === items.length - 1}
                  aria-label="Переместить ниже"
                  className="flex size-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-white hover:text-slate-700 disabled:opacity-30"
                >
                  <ChevronDown className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!confirm('Удалить этот блок?')) return
                    onChange(items.filter((_, i) => i !== index))
                    setOpenIndex(null)
                  }}
                  aria-label="Удалить блок"
                  className="flex size-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>

            {isOpen && (
              <div className="space-y-4 border-t border-slate-200 p-4">
                {renderItem(
                  item,
                  (patch) => {
                    const next = [...items]
                    next[index] = { ...item, ...patch }
                    onChange(next)
                  },
                  index,
                )}
              </div>
            )}
          </div>
        )
      })}

      {(max === undefined || items.length < max) && (
        <button
          type="button"
          onClick={() => {
            onChange([...items, create()])
            setOpenIndex(items.length)
          }}
          className="inline-flex items-center gap-2 rounded-lg border border-dashed border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
        >
          <Plus className="size-4" />
          {addLabel}
        </button>
      )}
    </div>
  )
}

/** Загрузка изображения с превью и обязательным описанием для доступности. */
export function ImageField({
  value,
  onChange,
  label = 'Изображение',
  folder = 'images',
}: {
  value: ImageValue
  onChange: (value: ImageValue) => void
  label?: string
  folder?: string
}) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const id = useId()

  const handleFile = async (file: File) => {
    setError(null)
    setInfo(null)
    setUploading(true)
    try {
      const result = await uploadImage(file, folder)
      onChange({ url: result.url, alt: value.alt, width: result.width, height: result.height })
      setInfo(`Загружено: ${result.width}×${result.height}, ${formatBytes(result.size)}`)
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Не удалось загрузить файл')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <p className="mb-3 text-sm font-medium text-slate-700">{label}</p>

      <div className="flex gap-4">
        <div className="relative size-28 shrink-0 overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-200">
          {value.url ? (
            <>
              <img src={value.url} alt="" className="size-full object-cover" />
              <button
                type="button"
                onClick={() => onChange({ url: '', alt: '' })}
                aria-label="Убрать изображение"
                className="absolute top-1 right-1 flex size-7 items-center justify-center rounded-md bg-white/90 text-slate-600 transition-colors hover:text-red-600"
              >
                <X className="size-4" />
              </button>
            </>
          ) : (
            <div className="flex size-full items-center justify-center text-slate-300">
              <ImageUp className="size-8" />
            </div>
          )}
        </div>

        <div className="flex-1 space-y-3">
          <input
            ref={inputRef}
            id={id}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) void handleFile(file)
              event.target.value = ''
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-60"
          >
            {uploading ? <Loader2 className="size-4 animate-spin" /> : <ImageUp className="size-4" />}
            {uploading ? 'Загружаю…' : value.url ? 'Заменить' : 'Загрузить'}
          </button>

          <input
            value={value.alt}
            placeholder="Описание изображения (для поиска и незрячих)"
            onChange={(event) => onChange({ ...value, alt: event.target.value })}
            className={inputClass}
          />

          {info && <p className="text-xs text-emerald-600">{info}</p>}
          {error && <p className="text-xs text-red-600">{error}</p>}
          {!info && !error && (
            <p className="text-xs text-slate-500">
              Файл автоматически сожмётся и переведётся в формат WebP — грузите как есть.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
