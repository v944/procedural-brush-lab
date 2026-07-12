import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  children: ReactNode
}

export function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  const base = 'h-11 px-6 rounded-lg font-medium text-sm transition-all duration-150 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50'

  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-hover hover:-translate-y-[1px] active:translate-y-0',
    secondary: 'bg-surface border border-border text-text-secondary hover:bg-surface-elevated hover:text-text-primary',
    ghost: 'bg-transparent text-text-secondary hover:text-text-primary',
  }

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
