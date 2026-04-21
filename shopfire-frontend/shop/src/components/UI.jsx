// src/components/UI.jsx — Shared UI Components
import React from 'react'
import { Loader2 } from 'lucide-react'

// ─── Button ───────────────────────────────────────────
export function Button({ children, variant = 'primary', size = 'md', className = '', loading, ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 font-body font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-stone-900 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary:   'bg-gradient-to-r from-red-700 via-orange-600 to-orange-500 hover:from-red-600 hover:via-orange-500 hover:to-amber-400 text-white shadow-fire hover:shadow-fire-lg focus:ring-orange-500',
    secondary: 'bg-stone-800 hover:bg-stone-700 text-stone-100 border border-stone-700 hover:border-orange-600/50 focus:ring-stone-600',
    danger:    'bg-red-700 hover:bg-red-600 text-white focus:ring-red-500',
    ghost:     'hover:bg-white/5 text-stone-300 hover:text-orange-400 focus:ring-stone-600',
    gold:      'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-stone-900 font-bold shadow-gold focus:ring-amber-400',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3 text-base',
    xl: 'px-9 py-4 text-lg',
  }

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} disabled={loading || props.disabled} {...props}>
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  )
}

// ─── Input ────────────────────────────────────────────
export function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-stone-300 font-body">{label}</label>}
      <input
        className={`w-full px-4 py-2.5 bg-stone-900 border rounded-lg text-stone-100 placeholder-stone-500
          font-body text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-600
          ${error ? 'border-red-500' : 'border-stone-700 hover:border-stone-600'}
          ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-400 font-body">{error}</p>}
    </div>
  )
}

// ─── Select ───────────────────────────────────────────
export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-stone-300 font-body">{label}</label>}
      <select
        className={`w-full px-4 py-2.5 bg-stone-900 border rounded-lg text-stone-100
          font-body text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-600
          ${error ? 'border-red-500' : 'border-stone-700'}
          ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-400 font-body">{error}</p>}
    </div>
  )
}

// ─── Card ─────────────────────────────────────────────
export function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`bg-stone-900/80 border border-stone-800 rounded-xl backdrop-blur-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

// ─── Badge ────────────────────────────────────────────
export function Badge({ children, color = 'gray' }) {
  const colors = {
    gray:   'bg-stone-700 text-stone-300',
    orange: 'bg-orange-900/60 text-orange-300 border border-orange-700/50',
    red:    'bg-red-900/60 text-red-300 border border-red-700/50',
    green:  'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50',
    yellow: 'bg-amber-900/60 text-amber-300 border border-amber-700/50',
    blue:   'bg-blue-900/60 text-blue-300 border border-blue-700/50',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold font-body ${colors[color]}`}>
      {children}
    </span>
  )
}

// ─── Spinner ──────────────────────────────────────────
export function Spinner({ size = 24 }) {
  return (
    <div className="flex items-center justify-center p-8">
      <Loader2 size={size} className="animate-spin text-orange-500" />
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────
export function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className={`relative w-full ${sizes[size]} bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800">
          <h2 className="font-display text-lg font-semibold text-stone-100">{title}</h2>
          <button onClick={onClose} className="text-stone-500 hover:text-stone-200 text-xl leading-none font-bold">×</button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

// ─── Table ────────────────────────────────────────────
export function Table({ headers, children, className = '' }) {
  return (
    <div className={`overflow-x-auto rounded-xl border border-stone-800 ${className}`}>
      <table className="w-full text-sm font-body">
        <thead>
          <tr className="bg-stone-800/60 border-b border-stone-700">
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-3 text-left font-semibold text-stone-400 whitespace-nowrap">{h}</th>
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
    <tr className={`border-b border-stone-800/50 hover:bg-white/[0.02] ${className}`} {...props}>
      {children}
    </tr>
  )
}

export function Td({ children, className = '' }) {
  return <td className={`px-4 py-3 text-stone-300 ${className}`}>{children}</td>
}

// ─── Toast ────────────────────────────────────────────
let toastFn = null
export const toast = {
  success: (msg) => toastFn?.('success', msg),
  error:   (msg) => toastFn?.('error', msg),
  info:    (msg) => toastFn?.('info', msg),
}

export function ToastContainer() {
  const [toasts, setToasts] = React.useState([])
  toastFn = (type, msg) => {
    const id = Date.now()
    setToasts(p => [...p, { id, type, msg }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500)
  }
  const colors = { success: 'border-emerald-600 bg-emerald-900/80', error: 'border-red-600 bg-red-900/80', info: 'border-orange-600 bg-orange-900/80' }
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
      {toasts.map(t => (
        <div key={t.id} className={`px-5 py-3 rounded-xl border backdrop-blur-sm text-sm font-body text-white shadow-lg animate-in slide-in-from-right ${colors[t.type]}`}>
          {t.msg}
        </div>
      ))}
    </div>
  )
}

// ─── Status Badge helper ──────────────────────────────
export function OrderStatusBadge({ status }) {
  const map = {
    pending:    { label: 'รอยืนยัน',       color: 'yellow' },
    confirmed:  { label: 'ยืนยันแล้ว',     color: 'blue' },
    processing: { label: 'กำลังเตรียม',    color: 'orange' },
    shipped:    { label: 'จัดส่งแล้ว',     color: 'orange' },
    delivered:  { label: 'ได้รับแล้ว',     color: 'green' },
    cancelled:  { label: 'ยกเลิก',          color: 'red' },
  }
  const s = map[status] || { label: status, color: 'gray' }
  return <Badge color={s.color}>{s.label}</Badge>
}
