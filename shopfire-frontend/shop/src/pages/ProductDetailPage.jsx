// src/pages/ProductDetailPage.jsx
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ShoppingCart, ArrowLeft, Package, Star, Minus, Plus } from 'lucide-react'
import { productsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { Button, Spinner, Badge, toast } from '../components/UI'

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addItem } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty]         = useState(1)
  const [adding, setAdding]   = useState(false)

  useEffect(() => {
    productsAPI.getOne(id)
      .then(r => setProduct(r.data))
      .catch(() => navigate('/products'))
      .finally(() => setLoading(false))
  }, [id])

  const handleAddCart = async () => {
    if (!user) { toast.info('กรุณาเข้าสู่ระบบก่อน'); return }
    if (user.role !== 'customer') { toast.info('เฉพาะลูกค้าเท่านั้น'); return }
    setAdding(true)
    try {
      await addItem(product._id || product.id, qty)
      toast.success(`เพิ่ม ${product.name} ×${qty} ในตะกร้าแล้ว`)
    } catch { toast.error('เกิดข้อผิดพลาด') }
    finally { setAdding(false) }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size={40} /></div>
  if (!product) return null

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-stone-400 hover:text-orange-400 font-body text-sm mb-8 transition-colors">
        <ArrowLeft size={16} />กลับ
      </button>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Image */}
        <div className="aspect-square bg-stone-800 rounded-2xl overflow-hidden border border-stone-700">
          {product.image || product.imageUrl
            ? <img src={product.image || product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-stone-600 text-8xl">📦</div>
          }
        </div>

        {/* Info */}
        <div className="flex flex-col gap-5">
          <div>
            <div className="flex items-center gap-2 mb-3">
              {product.category && <Badge color="orange">{product.category}</Badge>}
              {product.stock === 0 && <Badge color="red">หมดสต็อก</Badge>}
            </div>
            <h1 className="font-display font-bold text-3xl text-white leading-tight mb-2">{product.name}</h1>
            {product.rating && (
              <div className="flex items-center gap-1.5 text-sm text-stone-400 font-body">
                <Star size={14} className="text-amber-400 fill-amber-400" />
                <span>{product.rating}</span>
                {product.reviewCount && <span className="text-stone-600">({product.reviewCount} รีวิว)</span>}
              </div>
            )}
          </div>

          <div className="flex items-baseline gap-3">
            <span className="font-display font-black text-4xl text-orange-400">฿{product.price?.toLocaleString('th-TH')}</span>
            {product.originalPrice && (
              <span className="text-stone-500 line-through font-body text-lg">฿{product.originalPrice?.toLocaleString('th-TH')}</span>
            )}
          </div>

          {product.description && (
            <p className="font-body text-stone-400 leading-relaxed text-sm">{product.description}</p>
          )}

          <div className="flex items-center gap-2 text-sm font-body text-stone-400">
            <Package size={14} className="text-stone-500" />
            <span>คงเหลือ: <span className={product.stock > 0 ? 'text-emerald-400' : 'text-red-400'}>{product.stock} ชิ้น</span></span>
          </div>

          {/* Qty */}
          {product.stock > 0 && user?.role === 'customer' && (
            <div className="flex items-center gap-3">
              <span className="font-body text-stone-300 text-sm">จำนวน:</span>
              <div className="flex items-center border border-stone-700 rounded-lg overflow-hidden">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center text-stone-400 hover:text-white hover:bg-stone-800 transition-colors">
                  <Minus size={14} />
                </button>
                <span className="w-12 text-center font-body font-semibold text-stone-200">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="w-10 h-10 flex items-center justify-center text-stone-400 hover:text-white hover:bg-stone-800 transition-colors">
                  <Plus size={14} />
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="primary" size="lg" onClick={handleAddCart} loading={adding} disabled={product.stock === 0} className="flex-1">
              <ShoppingCart size={18} />
              {product.stock === 0 ? 'หมดสต็อก' : 'เพิ่มในตะกร้า'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
