import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { productsAPI } from '../services/api'
import ProductCard from '../components/ProductCard'
import { Spinner } from '../components/UI'

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
    <div className="mx-auto px-4 py-8 max-w-6xl">
      <h1 className="mb-6 font-display font-black text-brown-900 text-3xl">สินค้าทั้งหมด</h1>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={15} className="top-1/2 left-3 absolute text-brown-400 -translate-y-1/2" />
          <input
            defaultValue={q}
            onKeyDown={e => { if (e.key === 'Enter') set('q', e.target.value) }}
            placeholder="Search products..."
            className="bg-white py-2.5 pr-3 pl-9 border-2 border-cream-400 focus:border-brown-700 rounded-xl focus:outline-none w-full font-body text-brown-900 text-sm placeholder-brown-300"
          />
        </div>

        {categories.length > 0 && (
          <select value={category} onChange={e => set('category', e.target.value)}
            className="bg-white px-4 py-2.5 border-2 border-cream-400 focus:border-brown-700 rounded-xl focus:outline-none font-body text-brown-700 text-sm">
            <option value="">หมวดหมู่ทั้งหมด</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}

        <select value={sort} onChange={e => set('sort', e.target.value)}
          className="bg-white px-4 py-2.5 border-2 border-cream-400 focus:border-brown-700 rounded-xl focus:outline-none font-body text-brown-700 text-sm">
          <option value="createdAt">ใหม่ล่าสุด</option>
          <option value="price_asc">ราคา: น้อย → มาก</option>
          <option value="price_desc">ราคา: มาก → น้อย</option>
          <option value="name">ชื่อ A-Z</option>
        </select>

        {(q || category) && (
          <button onClick={() => setSearchParams({})} className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 px-4 py-2.5 rounded-xl font-display font-bold text-red-600 text-sm transition-colors">
            <X size={13} />ล้างตัวกรอง
          </button>
        )}
      </div>

      {loading
        ? <Spinner size={32} />
        : products.length === 0
          ? (
            <div className="py-20 text-center">
              <div className="mb-4 text-6xl">🔍</div>
              <p className="mb-2 font-display font-bold text-brown-400 text-xl">ไม่พบสินค้า</p>
              <p className="font-body text-brown-300 text-sm">ลองค้นหาด้วยคำอื่น</p>
            </div>
          )
          : (
            <>
              <div className="gap-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {products.map(p => <ProductCard key={p._id || p.id} product={p} />)}
              </div>
              {total > limit && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: Math.ceil(total / limit) }, (_, i) => i + 1).map(n => (
                    <button key={n}
                      onClick={() => { const p = new URLSearchParams(searchParams); p.set('page', n); setSearchParams(p) }}
                      className={`w-9 h-9 rounded-xl text-sm font-display font-bold transition-colors ${n === page ? 'bg-brown-800 text-white' : 'bg-white text-brown-700 hover:bg-cream-300 shadow-card'}`}>
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
