// src/components/ProductCard.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Star } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { toast } from './UI'

export default function ProductCard({ product }) {
  const { user } = useAuth()
  const { addItem } = useCart()
  const id = product._id || product.id

  const handleAddCart = async (e) => {
    e.preventDefault()
    if (!user) { toast.info('กรุณาเข้าสู่ระบบก่อน'); return }
    if (user.role !== 'customer') { toast.info('เฉพาะลูกค้าเท่านั้น'); return }
    try {
      await addItem(id, 1)
      toast.success('เพิ่มสินค้าในตะกร้าแล้ว')
    } catch { toast.error('เกิดข้อผิดพลาด') }
  }

  const price = typeof product.price === 'number' ? product.price.toLocaleString('th-TH') : product.price

  return (
    <Link to={`/products/${id}`} className="group block">
      <div className="bg-stone-900 border border-stone-800 group-hover:border-orange-700/50 rounded-xl overflow-hidden transition-all duration-300 group-hover:shadow-fire group-hover:-translate-y-0.5">
        {/* Image */}
        <div className="aspect-square bg-stone-800 overflow-hidden relative">
          {product.image || product.imageUrl
            ? <img src={product.image || product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            : <div className="w-full h-full flex items-center justify-center text-stone-600 text-5xl">📦</div>
          }
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="font-body font-semibold text-stone-300 text-sm bg-stone-900/80 px-3 py-1 rounded-full">หมดสต็อก</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-xs text-stone-500 font-body mb-1">{product.category}</p>
          <h3 className="font-display font-semibold text-stone-200 text-sm line-clamp-2 leading-snug mb-3 group-hover:text-orange-300 transition-colors">{product.name}</h3>

          <div className="flex items-center justify-between">
            <div>
              <span className="font-display font-bold text-lg text-orange-400">฿{price}</span>
              {product.originalPrice && (
                <span className="ml-2 text-xs text-stone-600 line-through font-body">฿{product.originalPrice.toLocaleString('th-TH')}</span>
              )}
            </div>
            <button
              onClick={handleAddCart}
              disabled={product.stock === 0}
              className="w-9 h-9 rounded-lg bg-orange-700 hover:bg-orange-600 disabled:bg-stone-700 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors shadow-fire"
            >
              <ShoppingCart size={16} />
            </button>
          </div>

          {product.rating && (
            <div className="flex items-center gap-1 mt-2">
              <Star size={11} className="text-amber-400 fill-amber-400" />
              <span className="text-xs text-stone-500 font-body">{product.rating}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
