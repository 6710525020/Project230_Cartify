// src/pages/ProductsPage.jsx
import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { productsAPI } from '../services/api'
import ProductCard from '../components/ProductCard'
import { Spinner, Select } from '../components/UI'

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [total, setTotal]       = useState(0)
  const [categories, setCategories] = useState([])

  const q        = searchParams.get('q') || ''
  const category = searchParams.get('category') || ''
  const sort     = searchParams.get('sort') || 'createdAt'
  const page     = parseInt(searchParams.get('page') || '1')
  const limit    = 12

  const set = (k, v) => {
    const p = new URLSearchParams(searchParams)
    v ? p.set(k, v) : p.delete(k)
    p.delete('page')
    setSearchParams(p)
  }

  useEffect(() => {
    productsAPI.getCategories()
      .then(r => setCategories(r.data || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    productsAPI.getAll({ q, category, sort, page, limit })
      .then(r => {
        setProducts(r.data.products || r.data || [])
        setTotal(r.data.total || 0)
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [q, category, sort, page])

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-white mb-2">สินค้าทั้งหมด</h1>
        {q && <p className="font-body text-stone-400 text-sm">ผลการค้นหา: "<span className="text-orange-400">{q}</span>" — {total} รายการ</p>}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-8 p-4 bg-stone-900/60 border border-stone-800 rounded-xl">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
          <input
            defaultValue={q}
            onKeyDown={e => { if (e.key === 'Enter') set('q', e.target.value) }}
            placeholder="ค้นหาสินค้า..."
            className="w-full pl-8 pr-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-sm text-stone-200 placeholder-stone-500 focus:outline-none focus:border-orange-600 font-body"
          />
        </div>

        <select value={category} onChange={e => set('category', e.target.value)}
          className="px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-sm text-stone-300 focus:outline-none focus:border-orange-600 font-body">
          <option value="">หมวดหมู่ทั้งหมด</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select value={sort} onChange={e => set('sort', e.target.value)}
          className="px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-sm text-stone-300 focus:outline-none focus:border-orange-600 font-body">
          <option value="createdAt">ใหม่ล่าสุด</option>
          <option value="price_asc">ราคา: น้อย → มาก</option>
          <option value="price_desc">ราคา: มาก → น้อย</option>
          <option value="name">ชื่อ A-Z</option>
        </select>

        {(q || category) && (
          <button onClick={() => setSearchParams({})} className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-400 hover:text-red-300 font-body border border-red-800/50 rounded-lg hover:bg-red-900/20 transition-colors">
            <X size={13} />ล้างตัวกรอง
          </button>
        )}
      </div>

      {loading
        ? <Spinner size={36} />
        : products.length === 0
          ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <p className="font-display text-xl text-stone-400 mb-2">ไม่พบสินค้า</p>
              <p className="font-body text-stone-500 text-sm">ลองค้นหาด้วยคำอื่น</p>
            </div>
          )
          : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {products.map(p => <ProductCard key={p._id || p.id} product={p} />)}
              </div>
              {/* Pagination */}
              {total > limit && (
                <div className="flex justify-center gap-2 mt-10">
                  {Array.from({ length: Math.ceil(total / limit) }, (_, i) => i + 1).map(n => (
                    <button key={n} onClick={() => { const p = new URLSearchParams(searchParams); p.set('page', n); setSearchParams(p) }}
                      className={`w-9 h-9 rounded-lg text-sm font-body font-medium transition-colors ${n === page ? 'bg-orange-700 text-white' : 'bg-stone-800 text-stone-400 hover:bg-stone-700'}`}>
                      {n}
                    </button>
                  ))}
                </div>
              )}
            </>
          )
      }
    </div>
  )
}
