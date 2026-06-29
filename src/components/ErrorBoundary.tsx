import { Component, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorBoundaryProps {
  children: ReactNode
  /** Custom fallback UI. If provided, overrides the default friendly fallback. */
  fallback?: ReactNode
  /** Called when an error is caught, for logging/reporting. */
  onError?: (error: Error, info: React.ErrorInfo) => void
  /** Human-readable label for the section this boundary wraps (e.g. "Projects section"). */
  sectionLabel?: string
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(
      `ErrorBoundary${this.props.sectionLabel ? ` [${this.props.sectionLabel}]` : ''} caught:`,
      error,
      info.componentStack,
    )
    this.props.onError?.(error, info)
  }

  /** Derive a friendly, section-specific message from the error or section label. */
  private getFriendlyMessage(): { title: string; body: string } {
    const label = this.props.sectionLabel ?? 'section'
    const errorMsg = this.state.error?.message ?? ''

    // Network / fetch errors
    if (
      errorMsg.includes('Failed to fetch') ||
      errorMsg.includes('network') ||
      errorMsg.includes('NetworkError') ||
      errorMsg.includes('AbortError')
    ) {
      return {
        title: 'Connection issue',
        body: `We couldn't load the ${label}. Please check your internet connection and try again.`,
      }
    }

    // Auth / permission errors
    if (
      errorMsg.includes('Unauthorized') ||
      errorMsg.includes('permission') ||
      errorMsg.includes('not authenticated') ||
      errorMsg.includes('Forbidden')
    ) {
      return {
        title: 'Access denied',
        body: `You don't have permission to view this ${label}. Try signing in with a different account.`,
      }
    }

    // Data / rendering errors
    if (errorMsg.includes('is not a function') || errorMsg.includes('undefined')) {
      return {
        title: 'Display error',
        body: `The ${label} encountered a rendering error. This may be a temporary glitch. Refreshing usually fixes it.`,
      }
    }

    // Generic fallback
    return {
      title: 'Something went wrong',
      body: `The ${label} couldn't be displayed. Please try refreshing the page. If this persists, contact support.`,
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      const { title, body } = this.getFriendlyMessage()

      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4 py-16">
          {/* Icon */}
          <div className="w-16 h-16 mb-6 rounded-full bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-400/20 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-amber-600 dark:text-amber-400" />
          </div>

          {/* Title */}
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-slate-800 dark:text-slate-200 mb-3">
            {title}
          </h2>

          {/* Body */}
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-md leading-relaxed">
            {body}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                this.setState({ hasError: false, error: undefined })
                window.location.reload()
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium font-heading rounded-full text-white bg-blue-500/80 hover:bg-blue-500/90 backdrop-blur-md border border-white/20 shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-all duration-300"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Page
            </button>
            <a
              href="/"
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Go Home
            </a>
          </div>

          {/* Technical details — collapsed by default */}
          {this.state.error && (
            <details className="mt-8 max-w-md">
              <summary className="text-xs text-slate-400 dark:text-slate-500 cursor-pointer hover:text-slate-500 dark:hover:text-slate-400 transition-colors">
                Technical details
              </summary>
              <pre className="mt-3 p-4 text-left text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-white/10 whitespace-pre-wrap break-all overflow-auto max-h-48">
                {this.state.error.message}
                {this.state.error.stack ? `\n\n${this.state.error.stack}` : ''}
              </pre>
            </details>
          )}
        </div>
      )
    }

    return this.props.children
  }
}
