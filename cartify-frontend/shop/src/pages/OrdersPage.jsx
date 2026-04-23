import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, ChevronDown, ChevronUp, CreditCard, Wallet, QrCode } from 'lucide-react'
import { ordersAPI } from '../services/api'
import { Spinner, OrderStatusBadge } from '../components/UI'

function paymentLabel(method) {
  const labels = {
    cash: 'Cash on Delivery',
    credit_card: 'Credit Card',
    promptpay: 'PromptPay',
    cod: 'Cash on Delivery',
    debit: 'Card / Online Payment',
  }
  return labels[method] || method || '-'
}

function paymentIcon(method) {
  if (method === 'promptpay') return QrCode
  if (method === 'cash' || method === 'cod') return Wallet
  return CreditCard
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    ordersAPI.getMyOrders()
      .then((r) => setOrders(r.data.orders || r.data || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner size={32} />

  return (
    <div className="mx-auto px-4 py-8 max-w-4xl">
      <h1 className="mb-8 font-display font-black text-brown-900 text-3xl">Order History</h1>

      {orders.length === 0 ? (
        <>
          <div className="bg-white shadow-card rounded-2xl overflow-hidden">
            <div className="grid grid-cols-4 bg-cream-200 px-5 py-3.5 border-cream-300 border-b">
              {['Order ID', 'Date', 'Total', 'Status'].map((h) => (
                <span key={h} className="font-display font-extrabold text-brown-700 text-sm">{h}</span>
              ))}
            </div>
            <div className="px-5 py-12 text-center">
              <Package size={40} className="mx-auto mb-3 text-brown-200" />
              <p className="font-display font-bold text-brown-300">You have not placed any orders yet.</p>
            </div>
          </div>
          <div className="mt-6 text-center">
            <Link to="/products" className="font-display font-bold text-brown-700 hover:text-brown-900 text-sm">
              Browse products
            </Link>
          </div>
        </>
      ) : (
        <div className="bg-white shadow-card rounded-2xl overflow-hidden">
          <div className="grid grid-cols-4 bg-cream-200 px-5 py-3.5 border-cream-300 border-b">
            {['Order ID', 'Date', 'Total', 'Status'].map((h) => (
              <span key={h} className="font-display font-extrabold text-brown-700 text-sm">{h}</span>
            ))}
          </div>
          {orders.map((order) => {
            const id = order._id || order.id
            const isExp = expanded === id
            const PaymentIcon = paymentIcon(order.payment?.method || order.paymentMethod)

            return (
              <div key={id} className="border-cream-200 last:border-0 border-b">
                <button
                  onClick={() => setExpanded(isExp ? null : id)}
                  className="items-center grid grid-cols-4 hover:bg-cream-50 px-5 py-4 w-full text-left transition-colors"
                >
                  <span className="font-mono text-brown-500 text-xs">#{String(id).padStart(6, '0')}</span>
                  <span className="font-body text-brown-600 text-sm">{order.createdAt ? new Date(order.createdAt).toLocaleDateString('th-TH') : '-'}</span>
                  <span className="font-display font-extrabold text-brown-900">THB {Number(order.total || 0).toLocaleString('th-TH')}</span>
                  <div className="flex justify-between items-center">
                    <OrderStatusBadge status={order.status} />
                    {isExp ? <ChevronUp size={14} className="text-brown-400" /> : <ChevronDown size={14} className="text-brown-400" />}
                  </div>
                </button>
                {isExp && (
                  <div className="bg-cream-50 px-5 pb-5 border-cream-200 border-t">
                    <div className="gap-6 grid md:grid-cols-2 pt-4">
                      <div>
                        <p className="mb-3 font-display font-extrabold text-brown-500 text-xs uppercase tracking-wider">Items</p>
                        {order.items?.map((item, i) => (
                          <div key={i} className="flex justify-between py-1 font-body text-brown-600 text-sm">
                            <span>{item.name} <span className="text-brown-400">x{item.quantity}</span></span>
                            <span className="font-semibold">THB {Number(item.price * item.quantity).toLocaleString('th-TH')}</span>
                          </div>
                        ))}
                      </div>
                      <div>
                        <p className="mb-3 font-display font-extrabold text-brown-500 text-xs uppercase tracking-wider">Shipping Details</p>
                        <div className="font-body text-brown-600 text-sm leading-relaxed">
                          <p className="font-bold text-brown-800">{order.shippingAddress?.name || '-'}</p>
                          <p>{order.shippingAddress?.phone || '-'}</p>
                          <p>{order.shippingAddress?.address || '-'}</p>
                          <p>{order.shippingAddress?.city || '-'}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-4 font-body text-brown-600 text-sm">
                          <PaymentIcon size={15} className="text-brown-500" />
                          <span>Payment: {paymentLabel(order.payment?.method || order.paymentMethod)}</span>
                        </div>
                        {order.payment?.slipAttachment && (
                          <a
                            href={order.payment.slipAttachment}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block mt-3 font-display font-bold text-brown-700 hover:text-brown-900 text-sm"
                          >
                            View attached slip
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
