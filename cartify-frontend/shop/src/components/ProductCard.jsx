import React from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { toast } from './UI'

export default function ProductCard({ product }) {
  const { user }   = useAuth()
  const { addItem } = useCart()
  const id = product._id || product.id

  const handleAddCart = async (e) => {
    e.preventDefault()
    if (!user)                  { toast.info('กรุณาเข้าสู่ระบบก่อน'); return }
    if (user.role !== 'customer') { toast.info('เฉพาะลูกค้าเท่านั้น'); return }
    try {
      await addItem(id, 1)
      toast.success('เพิ่มสินค้าในตะกร้าแล้ว')
    } catch { toast.error('เกิดข้อผิดพลาด') }
  }

  const price = typeof product.price === 'number'
    ? product.price.toLocaleString('th-TH')
    : product.price

  return (
    <Link to={`/products/${id}`} className="group block">
      <div className="bg-white shadow-card hover:shadow-card-hover rounded-2xl overflow-hidden transition-all hover:-translate-y-0.5 duration-200">
        {/* Image */}
        <div className="relative bg-cream-200 aspect-square overflow-hidden">
          {product.image || product.imageUrl
            ? <img src={product.image || product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            : <div className="flex justify-center items-center w-full h-full text-brown-300 text-5xl">📦</div>
          }
          {product.stock === 0 && (
            <div className="absolute inset-0 flex justify-center items-center bg-white/70">
              <span className="bg-cream-200 px-3 py-1 rounded-full font-display font-extrabold text-brown-500 text-sm">หมดสต็อก</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="mb-2 font-display font-extrabold text-brown-900 group-hover:text-brown-600 text-sm line-clamp-2 leading-snug transition-colors">{product.name}</h3>
          <div className="flex justify-between items-center">
            <span className="font-display font-extrabold text-brown-900 text-lg">฿{price}</span>
            <button
              onClick={handleAddCart}
              disabled={product.stock === 0}
              className="flex justify-center items-center bg-gold-400 hover:bg-gold-500 disabled:bg-cream-300 shadow-btn rounded-xl w-9 h-9 text-brown-900 transition-colors disabled:cursor-not-allowed"
            >
              <ShoppingCart size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
