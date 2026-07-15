import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  children: ReactNode
}

export function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  const base = 'h-10 px-5 rounded-lg font-medium text-sm transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D0D14]'

  const variants = {
    primary: 'bg-primary text-black font-bold hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(249,115,22,0.5)] active:translate-y-0',
    secondary: 'bg-white/5 text-gray-200 border border-white/5 rounded-lg hover:bg-white/10',
    ghost: 'bg-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5',
  }

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
