import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ArrowRight } from 'lucide-react'
import { productsAPI } from '../services/api'
import ProductCard from '../components/ProductCard'
import { Spinner } from '../components/UI'

export default function HomePage() {
  const [featured, setFeatured] = useState([])
  const [loading, setLoading]   = useState(true)
  const [searchQ, setSearchQ]   = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    productsAPI.getAll({ limit: 6, featured: true })
      .then(r => setFeatured(r.data.products || r.data || []))
      .catch(() => setFeatured([]))
      .finally(() => setLoading(false))
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQ.trim()) navigate(`/products?q=${encodeURIComponent(searchQ)}`)
  }

  return (
    <div className="bg-cream-200 min-h-screen">
      {/* Hero Banner */}
      <section className="mx-auto px-4 pt-8 pb-6 max-w-5xl">
        <div className="flex md:flex-row flex-col items-center gap-0 bg-cream-100 shadow-card rounded-3xl overflow-hidden">
          <div className="flex-1 px-10 py-10 md:py-14">
            <h1 className="mb-3 font-display font-black text-brown-900 text-4xl md:text-5xl leading-tight">
              Marketplace<br />for Everyone
            </h1>
            <p className="mb-6 font-body text-brown-500 text-sm">เลือกซื้อสินค้าคุณภาพ พร้อมโปรโมชั่นทุกวัน</p>
            <Link to="/products" className="inline-flex items-center gap-2 bg-brown-800 hover:bg-brown-700 shadow-btn px-6 py-3 rounded-xl font-display font-extrabold text-white text-sm transition-colors">
              เริ่มช้อป
            </Link>
          </div>
          <div className="flex-shrink-0 w-full md:w-80 h-56 md:h-72 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop"
              alt="hero"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="mx-auto px-4 pb-12 max-w-5xl">
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-display font-black text-brown-900 text-2xl">สินค้าแนะนำ</h2>
          <Link to="/products" className="flex items-center gap-1 font-display font-bold text-brown-600 hover:text-brown-800 text-sm transition-colors">
            ดูทั้งหมด <ArrowRight size={14} />
          </Link>
        </div>

        {loading
          ? <Spinner size={32} />
          : featured.length === 0
            ? (
              <div className="py-16 text-center">
                <p className="font-display font-bold text-brown-400 text-xl">ยังไม่มีสินค้า</p>
              </div>
            )
            : (
              <div className="gap-4 grid grid-cols-2 md:grid-cols-3">
                {featured.map(p => <ProductCard key={p._id || p.id} product={p} />)}
              </div>
            )
        }
      </section>
    </div>
  )
}
