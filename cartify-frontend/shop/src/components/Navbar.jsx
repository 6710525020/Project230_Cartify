import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Search, Menu, X, LogOut, Package, LayoutDashboard, BarChart3 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { count }        = useCart()
  const navigate         = useNavigate()
  const [open, setOpen]  = useState(false)
  const [searchQ, setSearchQ] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQ.trim()) navigate(`/products?q=${encodeURIComponent(searchQ)}`)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
    setOpen(false)
  }

  // role-based nav links (right side)
  const roleLinks = {
    staff:   [{ to: '/staff',   label: 'Staff' }],
    admin:   [{ to: '/admin',   label: 'Admin' }],
    manager: [{ to: '/manager', label: 'Dashboard' }],
  }
  const extraLinks = user ? (roleLinks[user.role] || []) : []

  // customer links
  const customerPublic = !user || user.role === 'customer'

  return (
    <nav className="top-0 z-40 sticky bg-brown-800 w-full text-white">
      <div className="flex items-center gap-4 mx-auto px-5 py-0 max-w-7xl h-14">
        {/* Logo */}
        <Link to="/" className="flex-shrink-0 mr-2 font-display font-extrabold text-gold-400 text-xl">
          Cartify
        </Link>

        {/* Search — customer only, desktop */}
        {customerPublic && (
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 items-center mx-2 max-w-sm">
            <div className="flex w-full">
              <input
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                placeholder="Search products..."
                className="flex-1 bg-white px-4 py-2 border-0 rounded-l-xl focus:outline-none font-body text-brown-900 text-sm placeholder-brown-400"
              />
              <button type="submit" className="bg-gold-400 hover:bg-gold-500 px-3 py-2 rounded-r-xl text-brown-900 transition-colors">
                <Search size={15} strokeWidth={2.5} />
              </button>
            </div>
          </form>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          <Link to="/" className="px-3 py-2 font-display font-bold text-white/80 hover:text-white text-sm transition-colors">Home</Link>

          {user?.role === 'customer' || !user ? (
            <Link to="/products" className="px-3 py-2 font-display font-bold text-white/80 hover:text-white text-sm transition-colors">Shop</Link>
          ) : null}

          {extraLinks.map(l => (
            <Link key={l.to} to={l.to} className="px-3 py-2 font-display font-bold text-white/80 hover:text-white text-sm transition-colors">{l.label}</Link>
          ))}

          {user ? (
            <>
              {user.role === 'customer' && (
                <>
                  <Link to="/orders" className="px-3 py-2 font-display font-bold text-white/80 hover:text-white text-sm transition-colors">Orders</Link>
                  <Link to="/cart" className="relative flex items-center gap-1 px-3 py-2 font-display font-bold text-white/80 hover:text-white text-sm transition-colors">
                    Cart
                    {count > 0 && (
                      <span className="flex justify-center items-center bg-gold-400 ml-1 rounded-full w-5 h-5 font-extrabold text-[10px] text-brown-900">{count}</span>
                    )}
                  </Link>
                </>
              )}
              <button onClick={handleLogout} className="flex items-center gap-1 ml-2 px-3 py-2 font-display font-bold text-white/60 hover:text-white text-sm transition-colors">
                <LogOut size={14} />Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/orders" className="px-3 py-2 font-display font-bold text-white/80 hover:text-white text-sm transition-colors">Orders</Link>
              <Link to="/login"    className="px-3 py-2 font-display font-bold text-white/80 hover:text-white text-sm transition-colors">Login</Link>
              <Link to="/register" className="px-3 py-2 font-display font-bold text-white/80 hover:text-white text-sm transition-colors">Register</Link>
              <Link to="/cart" className="relative flex items-center gap-1 px-3 py-2 font-display font-bold text-white/80 hover:text-white text-sm transition-colors">
                Cart
                {count > 0 && <span className="flex justify-center items-center bg-gold-400 ml-1 rounded-full w-5 h-5 font-extrabold text-[10px] text-brown-900">{count}</span>}
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-white/80 hover:text-white" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden flex flex-col gap-1 bg-brown-900 px-5 py-4 border-brown-700 border-t">
          {customerPublic && (
            <form onSubmit={e => { handleSearch(e); setOpen(false) }} className="flex mb-3">
              <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search products..."
                className="flex-1 bg-white px-4 py-2.5 rounded-l-xl focus:outline-none font-body text-brown-900 text-sm placeholder-brown-400" />
              <button type="submit" className="bg-gold-400 px-3 rounded-r-xl">
                <Search size={15} className="text-brown-900" />
              </button>
            </form>
          )}
          <Link to="/" className="py-2 font-display font-bold text-white/80 text-sm" onClick={() => setOpen(false)}>Home</Link>
          {(!user || user.role === 'customer') && <Link to="/products" className="py-2 font-display font-bold text-white/80 text-sm" onClick={() => setOpen(false)}>Shop</Link>}
          {extraLinks.map(l => <Link key={l.to} to={l.to} className="py-2 font-display font-bold text-white/80 text-sm" onClick={() => setOpen(false)}>{l.label}</Link>)}
          {user ? (
            <>
              {user.role === 'customer' && <>
                <Link to="/orders" className="py-2 font-display font-bold text-white/80 text-sm" onClick={() => setOpen(false)}>Orders</Link>
                <Link to="/cart"   className="py-2 font-display font-bold text-white/80 text-sm" onClick={() => setOpen(false)}>Cart ({count})</Link>
              </>}
              <button onClick={handleLogout} className="py-2 font-display font-bold text-red-300 text-sm text-left">Logout</button>
            </>
          ) : (
            <>
              <Link to="/orders"   className="py-2 font-display font-bold text-white/80 text-sm" onClick={() => setOpen(false)}>Orders</Link>
              <Link to="/login"    className="py-2 font-display font-bold text-white/80 text-sm" onClick={() => setOpen(false)}>Login</Link>
              <Link to="/register" className="py-2 font-display font-bold text-white/80 text-sm" onClick={() => setOpen(false)}>Register</Link>
              <Link to="/cart"     className="py-2 font-display font-bold text-white/80 text-sm" onClick={() => setOpen(false)}>Cart ({count})</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
