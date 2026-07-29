import type { ReactNode } from 'react'

export function PageHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-7">
      <h1 className="font-display text-2xl font-bold text-slate-900">{title}</h1>
      {description && <p className="mt-2 text-sm text-slate-500">{description}</p>}
    </div>
  )
}

export function EditorSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="mb-6 rounded-2xl bg-white p-6 ring-1 ring-slate-200">
      <h2 className="font-display text-lg font-bold text-slate-900">{title}</h2>
      {description && <p className="mt-1.5 mb-5 text-sm text-slate-500">{description}</p>}
      <div className={description ? 'space-y-5' : 'mt-5 space-y-5'}>{children}</div>
    </section>
  )
}

export function Grid({ children, cols = 2 }: { children: ReactNode; cols?: 2 | 3 }) {
  return (
    <div className={`grid gap-5 ${cols === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>{children}</div>
  )
}
