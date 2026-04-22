import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { ordersAPI } from '../services/api'
import { Button, Input, Spinner, toast, Modal } from '../components/UI'

export default function CartPage() {
  const { items, total, loading, updateItem, removeItem, clearCart } = useCart()
  const navigate  = useNavigate()
  const [checkout, setCheckout] = useState(false)
  const [placing, setPlacing]   = useState(false)
  const [address, setAddress]   = useState({ name: '', phone: '', address: '', city: '' })

  const handleRemove = async (itemId) => {
    try { await removeItem(itemId) }
    catch { toast.error('เกิดข้อผิดพลาด') }
  }
  const handleQty = async (itemId, qty) => {
    if (qty < 1) return
    try { await updateItem(itemId, qty) }
    catch { toast.error('เกิดข้อผิดพลาด') }
  }
  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    if (!address.name || !address.phone || !address.address) { toast.error('กรุณากรอกข้อมูลให้ครบ'); return }
    setPlacing(true)
    try {
      await ordersAPI.create({ items, shippingAddress: address })
      await clearCart()
      toast.success('สั่งซื้อสำเร็จ!')
      navigate('/orders')
    } catch { toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่') }
    finally { setPlacing(false) }
  }

  if (loading) return <Spinner size={32} />

  return (
    <div className="mx-auto px-4 py-8 max-w-5xl">
      <h1 className="mb-8 font-display font-black text-brown-900 text-3xl">Your Cart</h1>

      {items.length === 0 ? (
        <div className="py-20 text-center">
          <ShoppingBag size={56} className="mx-auto mb-4 text-brown-300" />
          <p className="mb-2 font-display font-bold text-brown-400 text-xl">ตะกร้าของคุณว่างเปล่า</p>
          <p className="mb-6 font-body text-brown-300 text-sm">เพิ่มสินค้าที่คุณชอบลงในตะกร้าได้เลย</p>
          <Link to="/products"><Button variant="primary">เลือกซื้อสินค้า</Button></Link>
        </div>
      ) : (
        <div className="gap-6 grid lg:grid-cols-3">
          <div className="flex flex-col gap-3 lg:col-span-2">
            {items.map(item => (
              <div key={item._id || item.id} className="flex gap-4 bg-white shadow-card p-4 rounded-2xl">
                <div className="flex-shrink-0 bg-cream-200 rounded-xl w-20 h-20 overflow-hidden">
                  {item.image
                    ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    : <div className="flex justify-center items-center w-full h-full text-2xl">📦</div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="mb-1 font-display font-extrabold text-brown-900 text-sm truncate">{item.name}</h3>
                  <p className="font-display font-extrabold text-brown-900 text-base">฿{item.price?.toLocaleString('th-TH')}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center border-2 border-cream-400 rounded-xl overflow-hidden">
                      <button onClick={() => handleQty(item._id || item.id, item.quantity - 1)} className="flex justify-center items-center hover:bg-cream-200 w-7 h-7 font-bold text-brown-500 transition-colors">
                        <Minus size={12} />
                      </button>
                      <span className="w-9 font-display font-extrabold text-brown-900 text-sm text-center">{item.quantity}</span>
                      <button onClick={() => handleQty(item._id || item.id, item.quantity + 1)} className="flex justify-center items-center hover:bg-cream-200 w-7 h-7 font-bold text-brown-500 transition-colors">
                        <Plus size={12} />
                      </button>
                    </div>
                    <button onClick={() => handleRemove(item._id || item.id)} className="text-brown-300 hover:text-red-500 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="font-display font-extrabold text-brown-900 text-sm">฿{(item.price * item.quantity).toLocaleString('th-TH')}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div>
            <div className="top-20 sticky bg-white shadow-card p-6 rounded-2xl">
              <h2 className="mb-4 font-display font-extrabold text-brown-900 text-xl">Total</h2>
              <p className="mb-5 font-display font-black text-brown-900 text-4xl">฿{total.toLocaleString('th-TH')}</p>
              <Button variant="primary" size="lg" onClick={() => setCheckout(true)} className="rounded-xl w-full">
                Checkout
              </Button>
            </div>
          </div>
        </div>
      )}

      <Modal open={checkout} onClose={() => setCheckout(false)} title="กรอกที่อยู่จัดส่ง">
        <form onSubmit={handlePlaceOrder} className="flex flex-col gap-4">
          <Input label="ชื่อ-นามสกุล" required value={address.name} onChange={e => setAddress(p => ({ ...p, name: e.target.value }))} />
          <Input label="เบอร์โทรศัพท์" required value={address.phone} onChange={e => setAddress(p => ({ ...p, phone: e.target.value }))} />
          <Input label="ที่อยู่" required value={address.address} onChange={e => setAddress(p => ({ ...p, address: e.target.value }))} />
          <Input label="เมือง/จังหวัด" required value={address.city} onChange={e => setAddress(p => ({ ...p, city: e.target.value }))} />
          <div className="flex justify-between items-center mt-1 pt-3 border-cream-300 border-t">
            <span className="font-display font-black text-brown-900 text-xl">฿{total.toLocaleString('th-TH')}</span>
            <Button type="submit" variant="primary" loading={placing}>ยืนยันคำสั่งซื้อ</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
