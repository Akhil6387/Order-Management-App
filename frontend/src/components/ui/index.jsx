import { Loader2, AlertCircle, SearchX } from 'lucide-react'

export function Spinner({ size = 'md', className = '' }) {
  const s = { sm: 14, md: 20, lg: 32 }[size]
  return <Loader2 size={s} className={`animate-spin text-brand-500 ${className}`} />
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-xl font-semibold text-surface-900">{title}</h1>
        {subtitle && <p className="text-sm text-surface-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

export function EmptyState({ title, description, icon: Icon }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 bg-surface-100 rounded-xl flex items-center justify-center mb-3">
        {Icon ? <Icon size={22} className="text-surface-400" /> : <SearchX size={22} className="text-surface-400" />}
      </div>
      <p className="font-medium text-surface-700">{title}</p>
      {description && <p className="text-sm text-surface-400 mt-1 max-w-xs">{description}</p>}
    </div>
  )
}

export function ErrorMessage({ message }) {
  return (
    <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 rounded-lg p-3 text-sm">
      <AlertCircle size={16} className="flex-shrink-0" />
      {message}
    </div>
  )
}

export function StatusBadge({ status }) {
  const map = {
    pending:   'badge-yellow',
    confirmed: 'badge-blue',
    shipped:   'badge-blue',
    delivered: 'badge-green',
    cancelled: 'badge-red',
  }
  return (
    <span className={map[status] || 'badge-gray'}>
      {status}
    </span>
  )
}

export function ConfirmModal({ open, title, message, onConfirm, onCancel, loading }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
        <h3 className="font-semibold text-surface-900">{title}</h3>
        <p className="text-sm text-surface-500 mt-1 mb-5">{message}</p>
        <div className="flex gap-3 justify-end">
          <button className="btn-secondary" onClick={onCancel} disabled={loading}>Cancel</button>
          <button className="btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? <Spinner size="sm" /> : null}
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export function Modal({ open, title, onClose, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-surface-100">
          <h2 className="font-semibold text-surface-900">{title}</h2>
          <button className="btn-ghost p-1" onClick={onClose}>✕</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
