import { cn } from '../../lib/cn'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
}

export function Button({ className, variant = 'primary', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex min-h-12 items-center justify-center gap-3 rounded-full border-2 border-slate-800 px-5 py-3 text-sm font-extrabold tracking-wide transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:cursor-not-allowed disabled:opacity-55',
        variant === 'primary' && 'candy-button bg-[var(--accent)] text-white',
        variant === 'secondary' && 'bg-white text-slate-800 hover:bg-[var(--tertiary)]',
        variant === 'ghost' && 'border-transparent bg-transparent px-2 text-slate-600 shadow-none hover:text-slate-900',
        className,
      )}
      {...props}
    />
  )
}
