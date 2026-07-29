import { Link } from 'react-router-dom'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'light'
type Size = 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 ' +
  'disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98] whitespace-nowrap'

const variants: Record<Variant, string> = {
  primary:
    'bg-brand-700 text-white shadow-[0_8px_24px_-10px_rgba(29,78,216,0.7)] hover:bg-brand-600 hover:shadow-[0_12px_32px_-12px_rgba(29,78,216,0.8)]',
  secondary: 'bg-white text-navy-900 ring-1 ring-line hover:ring-brand-300 hover:text-brand-700',
  ghost: 'text-white ring-1 ring-white/25 hover:bg-white/10 hover:ring-white/40 backdrop-blur-sm',
  light: 'bg-white text-brand-700 hover:bg-brand-50',
}

const sizes: Record<Size, string> = {
  md: 'h-11 px-5 text-[0.95rem]',
  lg: 'h-14 px-7 text-base',
}

type ButtonProps = {
  variant?: Variant
  size?: Size
  children: ReactNode
  className?: string
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps & ComponentProps<'button'>) {
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  )
}

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  className,
  to,
  children,
  ...props
}: ButtonProps & { to: string } & Omit<ComponentProps<'a'>, 'href'>) {
  const classes = cn(base, variants[variant], sizes[size], className)
  const isExternal = /^(https?:|tel:|mailto:)/.test(to)

  if (isExternal) {
    return (
      <a
        href={to}
        className={classes}
        {...(to.startsWith('http') && { target: '_blank', rel: 'noopener noreferrer' })}
        {...props}
      >
        {children}
      </a>
    )
  }

  return (
    <Link to={to} className={classes} {...props}>
      {children}
    </Link>
  )
}
