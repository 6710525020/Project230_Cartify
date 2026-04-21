// src/pages/OrdersPage.jsx  — ประวัติคำสั่งซื้อ (ลูกค้า)
import React, { useEffect, useState } from 'react'
import { Package, ChevronDown, ChevronUp } from 'lucide-react'
import { ordersAPI } from '../services/api'
import { Spinner, Table, Tr, Td, OrderStatusBadge } from '../components/UI'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    ordersAPI.getMyOrders()
      .then(r => setOrders(r.data.orders || r.data || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner size={36} />

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="font-display font-bold text-3xl text-white mb-8">ประวัติคำสั่งซื้อ</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <Package size={60} className="text-stone-700 mx-auto mb-4" />
          <p className="font-display text-xl text-stone-400 mb-2">ยังไม่มีคำสั่งซื้อ</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map(order => {
            const id = order._id || order.id
            const isExp = expanded === id
            return (
              <div key={id} className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpanded(isExp ? null : id)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-4 text-left">
                    <Package size={18} className="text-orange-500 flex-shrink-0" />
                    <div>
                      <p className="font-display font-semibold text-stone-200 text-sm">คำสั่งซื้อ #{id?.slice(-8).toUpperCase()}</p>
                      <p className="font-body text-xs text-stone-500 mt-0.5">{new Date(order.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <OrderStatusBadge status={order.status} />
                    <span className="font-display font-bold text-orange-400">฿{order.total?.toLocaleString('th-TH')}</span>
                    {isExp ? <ChevronUp size={16} className="text-stone-500" /> : <ChevronDown size={16} className="text-stone-500" />}
                  </div>
                </button>

                {isExp && (
                  <div className="px-6 pb-5 border-t border-stone-800">
                    <div className="mt-4 grid md:grid-cols-2 gap-6">
                      <div>
                        <p className="font-body text-xs text-stone-500 font-semibold uppercase tracking-wider mb-3">รายการสินค้า</p>
                        <div className="flex flex-col gap-2">
                          {order.items?.map((item, i) => (
                            <div key={i} className="flex justify-between items-center text-sm font-body">
                              <span className="text-stone-300">{item.name} <span className="text-stone-600">×{item.quantity}</span></span>
                              <span className="text-stone-400">฿{(item.price * item.quantity).toLocaleString('th-TH')}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="font-body text-xs text-stone-500 font-semibold uppercase tracking-wider mb-3">ที่อยู่จัดส่ง</p>
                        <div className="text-sm font-body text-stone-400 leading-relaxed">
                          <p className="text-stone-300 font-medium">{order.shippingAddress?.name}</p>
                          <p>{order.shippingAddress?.phone}</p>
                          <p>{order.shippingAddress?.address}</p>
                          <p>{order.shippingAddress?.city}</p>
                        </div>
                      </div>
                    </div>
                    {order.trackingNumber && (
                      <div className="mt-4 pt-4 border-t border-stone-800">
                        <p className="font-body text-sm text-stone-400">หมายเลขติดตาม: <span className="font-mono text-orange-400">{order.trackingNumber}</span></p>
                      </div>
                    )}
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
