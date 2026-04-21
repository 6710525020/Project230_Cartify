// src/components/Navbar.jsx
import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingCart, User, Search, Menu, X, Flame, LogOut, Package, LayoutDashboard, BarChart3 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { count } = useCart()
  const navigate   = useNavigate()
  const location   = useLocation()
  const [open, setOpen] = useState(false)
  const [searchQ, setSearchQ] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQ.trim()) navigate(`/products?q=${encodeURIComponent(searchQ)}`)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const roleLinks = {
    customer: [{ to: '/orders', label: 'คำสั่งซื้อของฉัน', icon: Package }],
    staff:    [{ to: '/staff',  label: 'จัดการคำสั่งซื้อ', icon: Package }],
    admin:    [{ to: '/admin',  label: 'แผงควบคุม',       icon: LayoutDashboard }],
    manager:  [{ to: '/manager',label: 'รายงาน',           icon: BarChart3 }],
  }

  const links = user ? (roleLinks[user.role] || []) : []

  return (
    <nav className="sticky top-0 z-40 w-full bg-stone-950/90 backdrop-blur-md border-b border-stone-800">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-700 to-orange-500 flex items-center justify-center shadow-fire">
            <Flame size={18} className="text-white" />
          </div>
          <span className="font-display font-bold text-xl text-white">Shop<span className="text-orange-500">Fire</span></span>
        </Link>

        {/* Search — desktop */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
            <input
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              placeholder="ค้นหาสินค้า..."
              className="w-full pl-9 pr-4 py-2 bg-stone-900 border border-stone-700 rounded-lg text-sm text-stone-200 placeholder-stone-500 focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600/50 font-body"
            />
          </div>
        </form>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1 ml-auto">
          <Link to="/products" className="px-3 py-2 text-sm text-stone-400 hover:text-orange-400 font-body transition-colors rounded-lg hover:bg-white/5">สินค้าทั้งหมด</Link>

          {links.map(l => (
            <Link key={l.to} to={l.to} className="px-3 py-2 text-sm text-stone-400 hover:text-orange-400 font-body transition-colors rounded-lg hover:bg-white/5 flex items-center gap-1.5">
              <l.icon size={14} />
              {l.label}
            </Link>
          ))}

          {user ? (
            <>
              {user.role === 'customer' && (
                <Link to="/cart" className="relative p-2 text-stone-400 hover:text-orange-400 transition-colors rounded-lg hover:bg-white/5">
                  <ShoppingCart size={20} />
                  {count > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-600 rounded-full text-[10px] font-bold text-white flex items-center justify-center">{count}</span>
                  )}
                </Link>
              )}
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-stone-800">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-600 to-red-700 flex items-center justify-center text-xs font-bold text-white">
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <span className="text-xs text-stone-400 font-body hidden lg:block max-w-[100px] truncate">{user.name}</span>
                <button onClick={handleLogout} className="p-1.5 text-stone-500 hover:text-red-400 transition-colors rounded" title="ออกจากระบบ">
                  <LogOut size={15} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <Link to="/login" className="px-4 py-2 text-sm font-semibold text-stone-300 hover:text-white font-body transition-colors">เข้าสู่ระบบ</Link>
              <Link to="/register" className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-red-700 to-orange-600 hover:from-red-600 hover:to-orange-500 rounded-lg shadow-fire transition-all font-body">สมัครสมาชิก</Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button className="md:hidden ml-auto text-stone-400" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-stone-800 bg-stone-950 px-4 py-4 flex flex-col gap-3">
          <form onSubmit={handleSearch} className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
            <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="ค้นหาสินค้า..." className="w-full pl-9 pr-4 py-2.5 bg-stone-900 border border-stone-700 rounded-lg text-sm text-stone-200 placeholder-stone-500 focus:outline-none focus:border-orange-600 font-body" />
          </form>
          <Link to="/products" className="py-2 text-stone-300 font-body text-sm" onClick={() => setOpen(false)}>สินค้าทั้งหมด</Link>
          {links.map(l => <Link key={l.to} to={l.to} className="py-2 text-stone-300 font-body text-sm flex items-center gap-2" onClick={() => setOpen(false)}><l.icon size={15} />{l.label}</Link>)}
          {user?.role === 'customer' && <Link to="/cart" className="py-2 text-stone-300 font-body text-sm flex items-center gap-2" onClick={() => setOpen(false)}><ShoppingCart size={15} />ตะกร้า ({count})</Link>}
          {user
            ? <button onClick={() => { handleLogout(); setOpen(false) }} className="py-2 text-left text-red-400 font-body text-sm flex items-center gap-2"><LogOut size={15} />ออกจากระบบ</button>
            : <div className="flex gap-2 pt-2"><Link to="/login" className="flex-1 text-center py-2.5 border border-stone-700 rounded-lg text-sm text-stone-300 font-body" onClick={() => setOpen(false)}>เข้าสู่ระบบ</Link><Link to="/register" className="flex-1 text-center py-2.5 bg-orange-600 rounded-lg text-sm text-white font-body font-semibold" onClick={() => setOpen(false)}>สมัครสมาชิก</Link></div>
          }
        </div>
      )}
    </nav>
  )
}
