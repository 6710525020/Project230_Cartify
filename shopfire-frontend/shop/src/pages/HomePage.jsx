// src/pages/HomePage.jsx
import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Flame, Zap, Shield, Truck, Star, ArrowRight, Search } from 'lucide-react'
import { productsAPI } from '../services/api'
import ProductCard from '../components/ProductCard'
import { Spinner } from '../components/UI'

export default function HomePage() {
  const [featured, setFeatured] = useState([])
  const [loading, setLoading]   = useState(true)
  const [searchQ, setSearchQ]   = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    productsAPI.getAll({ limit: 8, featured: true })
      .then(r => setFeatured(r.data.products || r.data || []))
      .catch(() => setFeatured([]))
      .finally(() => setLoading(false))
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQ.trim()) navigate(`/products?q=${encodeURIComponent(searchQ)}`)
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 px-4">
        {/* bg decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(194,65,12,0.3),transparent)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-64 bg-gradient-to-b from-orange-600/50 to-transparent" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-orange-700/40 bg-orange-900/20 text-orange-400 text-sm font-body font-medium mb-8">
            <Flame size={14} />
            <span>ช้อปปิ้งออนไลน์ที่ดีที่สุด</span>
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
            ช้อปปิ้ง<br />
            <span className="bg-gradient-to-r from-red-500 via-orange-500 to-amber-400 bg-clip-text text-transparent">ลุกเป็นไฟ</span>
          </h1>

          <p className="font-body text-stone-400 text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed">
            สินค้าคุณภาพสูง ราคาสมเหตุสมผล จัดส่งรวดเร็ว<br className="hidden md:block" />ประสบการณ์ช้อปปิ้งที่ไม่เหมือนใคร
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex max-w-lg mx-auto gap-2 mb-12">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" />
              <input
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                placeholder="ค้นหาสินค้า..."
                className="w-full pl-10 pr-4 py-3.5 bg-stone-900 border border-stone-700 rounded-xl text-stone-200 placeholder-stone-500 font-body focus:outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-600/30 text-sm"
              />
            </div>
            <button type="submit" className="px-6 py-3.5 bg-gradient-to-r from-red-700 to-orange-600 hover:from-red-600 hover:to-orange-500 text-white font-semibold rounded-xl shadow-fire font-body text-sm whitespace-nowrap transition-all">
              ค้นหา
            </button>
          </form>

          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/products" className="inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-red-700 via-orange-600 to-orange-500 hover:from-red-600 hover:to-amber-400 text-white font-semibold rounded-xl shadow-fire-lg transition-all font-body">
              เลือกซื้อสินค้า <ArrowRight size={16} />
            </Link>
            <Link to="/register" className="inline-flex items-center gap-2 px-7 py-3.5 border border-stone-700 hover:border-orange-600/50 text-stone-300 hover:text-white font-semibold rounded-xl transition-all font-body hover:bg-white/5">
              สมัครสมาชิกฟรี
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 px-4 border-y border-stone-800/50">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Truck, label: 'จัดส่งรวดเร็ว', desc: 'ภายใน 1-3 วัน' },
            { icon: Shield, label: 'ปลอดภัย 100%', desc: 'การชำระเงินเข้ารหัส' },
            { icon: Star, label: 'สินค้าคัดสรร', desc: 'คุณภาพมาตรฐาน' },
            { icon: Zap, label: 'บริการ 24/7', desc: 'พร้อมช่วยเหลือ' },
          ].map((f, i) => (
            <div key={i} className="flex flex-col items-center text-center gap-3 p-5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-800 to-orange-700 flex items-center justify-center shadow-fire">
                <f.icon size={22} className="text-orange-200" />
              </div>
              <div>
                <p className="font-display font-semibold text-stone-200 text-sm">{f.label}</p>
                <p className="font-body text-stone-500 text-xs mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-orange-500 font-body text-sm font-medium mb-2 flex items-center gap-1.5"><Flame size={14} />สินค้าแนะนำ</p>
              <h2 className="font-display font-bold text-3xl text-white">สินค้ายอดนิยม</h2>
            </div>
            <Link to="/products" className="hidden md:flex items-center gap-1 text-sm text-orange-400 hover:text-orange-300 font-body transition-colors">
              ดูทั้งหมด <ArrowRight size={14} />
            </Link>
          </div>

          {loading
            ? <Spinner size={36} />
            : featured.length === 0
              ? <p className="text-stone-500 text-center py-12 font-body">ไม่มีสินค้า</p>
              : <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {featured.map(p => <ProductCard key={p._id || p.id} product={p} />)}
                </div>
          }

          <div className="mt-10 text-center md:hidden">
            <Link to="/products" className="inline-flex items-center gap-2 text-sm text-orange-400 font-body">ดูสินค้าทั้งหมด <ArrowRight size={14} /></Link>
          </div>
        </div>
      </section>
    </div>
  )
}
