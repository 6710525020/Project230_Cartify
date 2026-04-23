import React from 'react'
import { Loader2 } from 'lucide-react'

export function Button({ children, variant = 'primary', size = 'md', className = '', loading, ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 font-display font-bold rounded-xl transition-all duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-brown-800 hover:bg-brown-700 active:bg-brown-900 text-white shadow-btn',
    secondary: 'bg-white hover:bg-cream-300 text-brown-800 border-2 border-brown-200 hover:border-brown-300',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    ghost: 'hover:bg-brown-100 text-brown-700 hover:text-brown-900',
    gold: 'bg-gold-400 hover:bg-gold-500 text-brown-900 font-extrabold shadow-btn',
    outline: 'border-2 border-brown-800 text-brown-800 hover:bg-brown-800 hover:text-white',
  }

  const sizes = {
    sm: 'px-4 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3 text-base',
    xl: 'px-8 py-4 text-lg',
  }

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} disabled={loading || props.disabled} {...props}>
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  )
}

export function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="font-display font-bold text-brown-700 text-sm">{label}</label>}
      <input
        className={`w-full px-4 py-3 bg-white border-2 rounded-xl text-brown-900 placeholder-brown-300
          font-body text-sm focus:outline-none focus:border-brown-700
          ${error ? 'border-red-400' : 'border-cream-400 hover:border-brown-300'}
          ${className}`}
        {...props}
      />
      {error && <p className="font-body text-red-500 text-xs">{error}</p>}
    </div>
  )
}

export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="font-display font-bold text-brown-700 text-sm">{label}</label>}
      <select
        className={`w-full px-4 py-3 bg-white border-2 rounded-xl text-brown-900
          font-body text-sm focus:outline-none focus:border-brown-700
          ${error ? 'border-red-400' : 'border-cream-400'}
          ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="font-body text-red-500 text-xs">{error}</p>}
    </div>
  )
}

export function Card({ children, className = '', ...props }) {
  return (
    <div className={`bg-white rounded-2xl shadow-card ${className}`} {...props}>
      {children}
    </div>
  )
}

export function Badge({ children, color = 'gray' }) {
  const colors = {
    gray: 'bg-cream-300 text-brown-600',
    orange: 'bg-amber-100 text-amber-800',
    red: 'bg-red-100 text-red-700',
    green: 'bg-emerald-100 text-emerald-700',
    yellow: 'bg-yellow-100 text-yellow-800',
    blue: 'bg-blue-100 text-blue-700',
    brown: 'bg-brown-800 text-white',
  }

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold font-display ${colors[color]}`}>
      {children}
    </span>
  )
}

export function Spinner({ size = 24 }) {
  return (
    <div className="flex justify-center items-center p-8">
      <Loader2 size={size} className="text-brown-700 animate-spin" />
    </div>
  )
}

export function Modal({ open, onClose, title, children, size = 'md', bodyClassName = '' }) {
  if (!open) return null
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }

  return (
    <div className="z-50 fixed inset-0 flex justify-center items-center p-3 sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-brown-950/40 backdrop-blur-sm" />
      <div
        className={`relative flex max-h-[calc(100vh-1.5rem)] sm:max-h-[calc(100vh-2rem)] w-full ${sizes[size]} flex-col overflow-hidden rounded-3xl bg-white shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-5 sm:px-7 py-4 sm:py-5 border-cream-300 border-b">
          <h2 className="font-display font-extrabold text-brown-900 text-xl">{title}</h2>
          <button onClick={onClose} className="flex justify-center items-center hover:bg-cream-300 rounded-full w-8 h-8 font-bold text-brown-500 hover:text-brown-800 text-xl transition-colors">X</button>
        </div>
        <div className={`overflow-y-auto px-5 sm:px-7 py-5 sm:py-6 ${bodyClassName}`}>{children}</div>
      </div>
    </div>
  )
}

export function Table({ headers, children, className = '' }) {
  return (
    <div className={`overflow-x-auto rounded-2xl bg-white shadow-card ${className}`}>
      <table className="w-full font-body text-sm">
        <thead>
          <tr className="bg-cream-200 border-cream-300 border-b">
            {headers.map((h, i) => (
              <th key={i} className="px-5 py-3.5 font-display font-extrabold text-brown-700 text-left whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

export function Tr({ children, className = '', ...props }) {
  return (
    <tr className={`border-b border-cream-200 hover:bg-cream-50 ${className}`} {...props}>
      {children}
    </tr>
  )
}

export function Td({ children, className = '' }) {
  return <td className={`px-5 py-3.5 text-brown-700 ${className}`}>{children}</td>
}

let toastFn = null
export const toast = {
  success: (msg) => toastFn?.('success', msg),
  error: (msg) => toastFn?.('error', msg),
  info: (msg) => toastFn?.('info', msg),
}

export function ToastContainer() {
  const [toasts, setToasts] = React.useState([])

  toastFn = (type, msg) => {
    const id = Date.now()
    setToasts((p) => [...p, { id, type, msg }])
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500)
  }

  const colors = {
    success: 'bg-emerald-700 text-white',
    error: 'bg-red-700 text-white',
    info: 'bg-brown-800 text-white',
  }

  return (
    <div className="top-4 right-4 z-[9999] fixed flex flex-col gap-2">
      {toasts.map((t) => (
        <div key={t.id} className={`px-5 py-3 rounded-xl text-sm font-display font-bold shadow-lg animate-in slide-in-from-right ${colors[t.type]}`}>
          {t.msg}
        </div>
      ))}
    </div>
  )
}

export function OrderStatusBadge({ status }) {
  const map = {
    pending: { label: 'Pending', color: 'yellow' },
    payment_completed: { label: 'Payment Completed', color: 'blue' },
    shipping_in_progress: { label: 'Shipping In Progress', color: 'orange' },
    delivered: { label: 'Delivered', color: 'green' },
    confirmed: { label: 'Confirmed', color: 'blue' },
    processing: { label: 'Processing', color: 'orange' },
    shipped: { label: 'Shipped', color: 'orange' },
    cancelled: { label: 'Cancelled', color: 'red' },
    completed: { label: 'Completed', color: 'green' },
  }
  const s = map[status] || { label: status, color: 'gray' }
  return <Badge color={s.color}>{s.label}</Badge>
}
