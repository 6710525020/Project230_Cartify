// src/pages/CartPage.jsx
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { ordersAPI } from '../services/api'
import { Button, Input, Spinner, toast, Modal } from '../components/UI'

export default function CartPage() {
  const { items, total, loading, updateItem, removeItem, clearCart } = useCart()
  const navigate = useNavigate()
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
      const r = await ordersAPI.create({ items, shippingAddress: address })
      await clearCart()
      toast.success('สั่งซื้อสำเร็จ!')
      navigate('/orders')
    } catch { toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่') }
    finally { setPlacing(false) }
  }

  if (loading) return <Spinner size={36} />

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="font-display font-bold text-3xl text-white mb-8">ตะกร้าสินค้า</h1>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag size={60} className="text-stone-700 mx-auto mb-4" />
          <p className="font-display text-xl text-stone-400 mb-2">ตะกร้าของคุณว่างเปล่า</p>
          <p className="font-body text-stone-500 text-sm mb-6">เพิ่มสินค้าที่คุณชอบลงในตะกร้าได้เลย</p>
          <Link to="/products">
            <Button variant="primary">เลือกซื้อสินค้า</Button>
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-3">
            {items.map(item => (
              <div key={item._id || item.id} className="flex gap-4 p-4 bg-stone-900 border border-stone-800 rounded-xl">
                <div className="w-20 h-20 bg-stone-800 rounded-lg overflow-hidden flex-shrink-0">
                  {item.image
                    ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-stone-200 text-sm truncate mb-1">{item.name}</h3>
                  <p className="font-body text-orange-400 font-bold text-base">฿{item.price?.toLocaleString('th-TH')}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center border border-stone-700 rounded-lg overflow-hidden">
                      <button onClick={() => handleQty(item._id || item.id, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center text-stone-400 hover:text-white hover:bg-stone-800 transition-colors">
                        <Minus size={12} />
                      </button>
                      <span className="w-9 text-center font-body text-sm text-stone-200">{item.quantity}</span>
                      <button onClick={() => handleQty(item._id || item.id, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center text-stone-400 hover:text-white hover:bg-stone-800 transition-colors">
                        <Plus size={12} />
                      </button>
                    </div>
                    <button onClick={() => handleRemove(item._id || item.id)} className="text-stone-600 hover:text-red-400 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-display font-bold text-stone-100 text-sm">฿{(item.price * item.quantity).toLocaleString('th-TH')}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 sticky top-20">
              <h2 className="font-display font-semibold text-stone-200 text-lg mb-4">สรุปคำสั่งซื้อ</h2>
              <div className="flex justify-between text-sm font-body text-stone-400 mb-2">
                <span>สินค้า ({items.length} รายการ)</span>
                <span>฿{total.toLocaleString('th-TH')}</span>
              </div>
              <div className="flex justify-between text-sm font-body text-stone-400 mb-4 pb-4 border-b border-stone-800">
                <span>ค่าจัดส่ง</span>
                <span className="text-emerald-400">ฟรี</span>
              </div>
              <div className="flex justify-between font-display font-bold text-white text-lg mb-5">
                <span>รวมทั้งสิ้น</span>
                <span className="text-orange-400">฿{total.toLocaleString('th-TH')}</span>
              </div>
              <Button variant="primary" size="lg" onClick={() => setCheckout(true)} className="w-full">
                ดำเนินการสั่งซื้อ <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      <Modal open={checkout} onClose={() => setCheckout(false)} title="กรอกที่อยู่จัดส่ง" size="md">
        <form onSubmit={handlePlaceOrder} className="flex flex-col gap-4">
          <Input label="ชื่อ-นามสกุล" required value={address.name} onChange={e => setAddress(p => ({ ...p, name: e.target.value }))} />
          <Input label="เบอร์โทรศัพท์" required value={address.phone} onChange={e => setAddress(p => ({ ...p, phone: e.target.value }))} />
          <Input label="ที่อยู่" required value={address.address} onChange={e => setAddress(p => ({ ...p, address: e.target.value }))} />
          <Input label="เมือง/จังหวัด" required value={address.city} onChange={e => setAddress(p => ({ ...p, city: e.target.value }))} />
          <div className="flex items-center justify-between pt-2 border-t border-stone-800 mt-2">
            <span className="font-display font-bold text-orange-400 text-lg">฿{total.toLocaleString('th-TH')}</span>
            <Button type="submit" variant="primary" loading={placing}>ยืนยันคำสั่งซื้อ</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
