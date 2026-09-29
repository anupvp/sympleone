import type { ReactNode } from 'react'

interface ModuleFrameProps {
  title?: string
  action?: ReactNode
  status: 'idle' | 'loading' | 'success' | 'error'
  error?: string | null
  children: ReactNode
  className?: string
}

export function ModuleFrame({
  title,
  action,
  status,
  error,
  children,
  className = '',
}: ModuleFrameProps) {
  return (
    <section className={`dash-module ${className}`.trim()}>
      {(title || action) && (
        <header className="dash-module__header">
          {title ? <h2 className="dash-module__title">{title}</h2> : <span />}
          {action}
        </header>
      )}
      {status === 'loading' && (
        <div className="dash-module__loading" aria-busy="true">
          Loading…
        </div>
      )}
      {status === 'error' && (
        <p className="dash-module__error" role="alert">{error ?? 'Something went wrong'}</p>
      )}
      {status !== 'loading' && status !== 'error' && children}
    </section>
  )
}
