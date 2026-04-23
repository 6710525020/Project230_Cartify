import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, CreditCard, Wallet, QrCode } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { ordersAPI } from '../services/api'
import { Button, Input, Spinner, Select, toast, Modal } from '../components/UI'

function methodMeta(method) {
  const map = {
    cash: { label: 'Cash on Delivery', icon: Wallet },
    credit_card: { label: 'Credit Card', icon: CreditCard },
    promptpay: { label: 'PromptPay', icon: QrCode },
  }
  return map[method] || map.cash
}

export default function CartPage() {
  const { items, total, loading, updateItem, removeItem, clearCart } = useCart()
  const navigate = useNavigate()
  const [checkout, setCheckout] = useState(false)
  const [placing, setPlacing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [slipAttachment, setSlipAttachment] = useState('')
  const [slipName, setSlipName] = useState('')
  const [address, setAddress] = useState({ name: '', phone: '', address: '', city: '' })

  const paymentInfo = useMemo(() => methodMeta(paymentMethod), [paymentMethod])
  const slipRequired = paymentMethod === 'promptpay'

  const handleRemove = async (itemId) => {
    try { await removeItem(itemId) }
    catch { toast.error('Something went wrong.') }
  }

  const handleQty = async (itemId, qty) => {
    if (qty < 1) return
    try { await updateItem(itemId, qty) }
    catch { toast.error('Something went wrong.') }
  }

  const handleSlipChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) {
      setSlipAttachment('')
      setSlipName('')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setSlipAttachment(String(reader.result || ''))
      setSlipName(file.name)
    }
    reader.readAsDataURL(file)
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    if (!address.name || !address.phone || !address.address) {
      toast.error('Please complete the shipping details.')
      return
    }
    if (slipRequired && !slipAttachment) {
      toast.error('Please attach your PromptPay slip before continuing.')
      return
    }

    setPlacing(true)
    try {
      await ordersAPI.create({
        shippingAddress: address,
        paymentMethod,
        slipAttachment: slipAttachment || null,
      })
      await clearCart()
      setCheckout(false)
      toast.success(paymentMethod === 'promptpay' ? 'PromptPay payment submitted successfully!' : 'Order placed successfully!')
      navigate('/orders')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Checkout failed. Please try again.')
    } finally {
      setPlacing(false)
    }
  }

  if (loading) return <Spinner size={32} />

  return (
    <div className="mx-auto px-4 py-8 max-w-5xl">
      <h1 className="mb-8 font-display font-black text-brown-900 text-3xl">Your Cart</h1>

      {items.length === 0 ? (
        <div className="py-20 text-center">
          <ShoppingBag size={56} className="mx-auto mb-4 text-brown-300" />
          <p className="mb-2 font-display font-bold text-brown-400 text-xl">Your cart is empty</p>
          <p className="mb-6 font-body text-brown-300 text-sm">Add products you like and they will appear here.</p>
          <Link to="/products"><Button variant="primary">Continue Shopping</Button></Link>
        </div>
      ) : (
        <div className="gap-6 grid lg:grid-cols-3">
          <div className="flex flex-col gap-3 lg:col-span-2">
            {items.map((item) => (
              <div key={item._id || item.id} className="flex gap-4 bg-white shadow-card p-4 rounded-2xl">
                <div className="flex-shrink-0 bg-cream-200 rounded-xl w-20 h-20 overflow-hidden">
                  {item.image
                    ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    : <div className="flex justify-center items-center w-full h-full text-xs text-brown-400">No Image</div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="mb-1 font-display font-extrabold text-brown-900 text-sm truncate">{item.name}</h3>
                  <p className="font-display font-extrabold text-brown-900 text-base">THB {item.price?.toLocaleString('th-TH')}</p>
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
                    <button onClick={() => handleRemove(item._id || item.id)} className="text-brown-300 hover:text-red-500 transition-colors" aria-label="Remove item">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="font-display font-extrabold text-brown-900 text-sm">THB {(item.price * item.quantity).toLocaleString('th-TH')}</p>
                </div>
              </div>
            ))}
          </div>

          <div>
            <div className="top-20 sticky bg-white shadow-card p-6 rounded-2xl">
              <h2 className="mb-4 font-display font-extrabold text-brown-900 text-xl">Total</h2>
              <p className="mb-5 font-display font-black text-brown-900 text-4xl">THB {total.toLocaleString('th-TH')}</p>
              <Button variant="primary" size="lg" onClick={() => setCheckout(true)} className="rounded-xl w-full">
                Checkout
              </Button>
            </div>
          </div>
        </div>
      )}

      <Modal open={checkout} onClose={() => setCheckout(false)} title="Checkout & Payment" size="lg">
        <form onSubmit={handlePlaceOrder} className="flex flex-col gap-6">
          <div className="gap-4 grid md:grid-cols-2">
            <Input label="Full Name" required value={address.name} onChange={(e) => setAddress((p) => ({ ...p, name: e.target.value }))} />
            <Input label="Phone Number" required value={address.phone} onChange={(e) => setAddress((p) => ({ ...p, phone: e.target.value }))} />
          </div>
          <Input label="Address" required value={address.address} onChange={(e) => setAddress((p) => ({ ...p, address: e.target.value }))} />
          <Input label="City / Province" required value={address.city} onChange={(e) => setAddress((p) => ({ ...p, city: e.target.value }))} />

          <div className="bg-cream-100 p-5 border border-cream-300 rounded-2xl">
            <div className="flex items-center gap-2 mb-4">
              <paymentInfo.icon size={18} className="text-brown-700" />
              <h3 className="font-display font-extrabold text-brown-900 text-lg">Payment Method</h3>
            </div>
            <Select label="Choose how you want to pay" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <option value="cash">Cash on Delivery</option>
              <option value="credit_card">Credit Card</option>
              <option value="promptpay">PromptPay</option>
            </Select>

            <div className="bg-white mt-4 p-4 border border-cream-300 rounded-xl">
              <p className="font-display font-bold text-brown-800 text-sm">{paymentInfo.label}</p>
              {paymentMethod === 'cash' && (
                <p className="mt-2 font-body text-brown-500 text-sm">You will pay when the order arrives.</p>
              )}
              {paymentMethod === 'credit_card' && (
                <p className="mt-2 font-body text-brown-500 text-sm">Card payments are recorded with the order. You can also attach a confirmation slip if needed.</p>
              )}
              {paymentMethod === 'promptpay' && (
                <div className="mt-2 space-y-2">
                  <p className="font-body text-brown-500 text-sm">Pay to PromptPay ID `089-000-0000` and attach your payment slip before placing the order.</p>
                  <div className="bg-cream-100 p-3 border border-dashed border-brown-300 rounded-xl font-body text-brown-600 text-sm">
                    PromptPay reference: `CARTIFY-STORE`
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4">
              <label className="block mb-1.5 font-display font-bold text-brown-700 text-sm">
                {slipRequired ? 'Slip Attachment (Required)' : 'Slip Attachment (Optional)'}
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleSlipChange}
                className="block bg-white px-4 py-3 border-2 border-cream-400 rounded-xl w-full font-body text-brown-700 text-sm"
              />
              {slipName && <p className="mt-2 font-body text-brown-500 text-xs">Attached: {slipName}</p>}
            </div>
          </div>

          <div className="flex md:flex-row flex-col justify-between items-start md:items-center gap-3 pt-3 border-cream-300 border-t">
            <div>
              <p className="font-body text-brown-500 text-sm">Order total</p>
              <span className="font-display font-black text-brown-900 text-2xl">THB {total.toLocaleString('th-TH')}</span>
            </div>
            <Button type="submit" variant="primary" loading={placing}>
              {paymentMethod === 'promptpay' ? 'Pay With PromptPay' : 'Place Order'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
