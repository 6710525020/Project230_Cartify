import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Minus, Plus, Shield, Truck, RefreshCw } from 'lucide-react'
import { productsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { Button, Spinner, toast } from '../components/UI'

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addItem } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    productsAPI.getOne(id)
      .then((r) => setProduct(r.data))
      .catch(() => navigate('/products'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  const handleAddCart = async () => {
    if (!user) {
      toast.info('เธเธฃเธธเธ“เธฒเน€เธเนเธฒเธชเธนเนเธฃเธฐเธเธเธเนเธญเธ')
      return false
    }
    if (user.role !== 'customer') {
      toast.info('เน€เธเธเธฒเธฐเธฅเธนเธเธเนเธฒเน€เธ—เนเธฒเธเธฑเนเธ')
      return false
    }

    setAdding(true)
    try {
      await addItem(product._id || product.id, qty)
      toast.success(`เน€เธเธดเนเธก ${product.name} ร—${qty} เนเธเธ•เธฐเธเธฃเนเธฒเนเธฅเนเธง`)
      return true
    } catch {
      toast.error('เน€เธเธดเธ”เธเนเธญเธเธดเธ”เธเธฅเธฒเธ”')
      return false
    } finally {
      setAdding(false)
    }
  }

  if (loading) return <div className="flex justify-center items-center min-h-screen"><Spinner size={36} /></div>
  if (!product) return null

  return (
    <div className="mx-auto px-4 py-8 max-w-4xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-6 font-body text-brown-500 hover:text-brown-800 text-sm transition-colors">
        <ArrowLeft size={16} />เธเธฅเธฑเธ
      </button>

      <div className="gap-8 grid md:grid-cols-2">
        <div>
          <div className="bg-cream-200 shadow-card mb-3 rounded-2xl aspect-square overflow-hidden">
            {product.image || product.imageUrl
              ? <img src={product.image || product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
              : <div className="flex justify-center items-center w-full h-full text-brown-300 text-8xl">๐“ฆ</div>
            }
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.slice(0, 4).map((img, i) => (
                <div key={i} className="border-2 border-cream-300 rounded-xl w-14 h-14 overflow-hidden cursor-pointer">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <div>
            {product.category && <p className="mb-1 font-display font-bold text-brown-400 text-xs uppercase tracking-wider">{product.category}</p>}
            <h1 className="mb-3 font-display font-black text-brown-900 text-3xl leading-tight">{product.name}</h1>
            <p className="font-display font-black text-brown-900 text-3xl">เธฟ{product.price?.toLocaleString('th-TH')}</p>
          </div>

          {product.description && (
            <p className="font-body text-brown-500 text-sm leading-relaxed">{product.description}</p>
          )}

          {product.stock > 0 && user?.role === 'customer' && (
            <div className="flex items-center gap-3">
              <div className="flex items-center border-2 border-cream-400 rounded-xl overflow-hidden">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="flex justify-center items-center hover:bg-cream-200 w-10 h-10 font-bold text-brown-500 hover:text-brown-900 transition-colors">
                  <Minus size={14} />
                </button>
                <span className="w-12 font-display font-extrabold text-brown-900 text-sm text-center">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="flex justify-center items-center hover:bg-cream-200 w-10 h-10 font-bold text-brown-500 hover:text-brown-900 transition-colors">
                  <Plus size={14} />
                </button>
              </div>
              <span className="font-body text-brown-400 text-xs">เธเธเน€เธซเธฅเธทเธญ: {product.stock} เธเธดเนเธ</span>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Button variant="primary" size="lg" onClick={handleAddCart} loading={adding} disabled={product.stock === 0} className="rounded-xl w-full">
              {product.stock === 0 ? 'เธซเธกเธ”เธชเธ•เนเธญเธ' : 'เน€เธเธดเนเธกเธฅเธเธ•เธฐเธเธฃเนเธฒ'}
            </Button>
            {product.stock > 0 && (
              <Button
                variant="primary"
                size="lg"
                disabled={product.stock === 0 || adding}
                onClick={async () => {
                  const added = await handleAddCart()
                  if (added) navigate('/cart')
                }}
                className="rounded-xl w-full"
              >
                เธเธทเนเธญเธ—เธฑเธเธ—เธต
              </Button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { icon: Shield, label: 'เธฃเธฑเธเธเธฃเธฐเธเธฑเธ 1 เธเธต' },
              { icon: Truck, label: 'เธเธฑเธ”เธชเนเธเธเธฃเธต' },
              { icon: RefreshCw, label: 'เธเธทเธเธชเธดเธเธเนเธฒเนเธ 7 เธงเธฑเธ' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-1.5 bg-blue-100 px-3 py-2 rounded-xl font-display font-bold text-blue-700 text-xs">
                <f.icon size={12} />{f.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
