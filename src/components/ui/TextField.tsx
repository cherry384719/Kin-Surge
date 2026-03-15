import { cn } from '../../lib/cn'

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export function TextField({ label, className, ...props }: TextFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.24em] text-slate-500">{label}</span>
      <input
        className={cn('h-12 w-full rounded-[var(--radius-md)] border-2 border-slate-300 bg-white px-4 text-sm font-medium text-slate-800 transition-all duration-200 placeholder:text-slate-400 focus:border-[var(--accent)] focus:outline-none focus:shadow-[4px_4px_0_0_var(--accent)]', className)}
        {...props}
      />
    </label>
  )
}
