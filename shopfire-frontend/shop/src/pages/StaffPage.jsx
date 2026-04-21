// src/pages/StaffPage.jsx — พนักงาน: จัดการคำสั่งซื้อ
import React, { useEffect, useState } from 'react'
import { Package, CheckCircle, Truck, Search, RefreshCw } from 'lucide-react'
import { ordersAPI } from '../services/api'
import { Button, Spinner, Table, Tr, Td, OrderStatusBadge, Badge, Modal, Input, Select, toast } from '../components/UI'

const STATUS_OPTIONS = [
  { value: 'pending',    label: 'รอยืนยัน' },
  { value: 'confirmed',  label: 'ยืนยันแล้ว' },
  { value: 'processing', label: 'กำลังเตรียม' },
  { value: 'shipped',    label: 'จัดส่งแล้ว' },
  { value: 'delivered',  label: 'ได้รับแล้ว' },
  { value: 'cancelled',  label: 'ยกเลิก' },
]

export default function StaffPage() {
  const [orders, setOrders]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState('pending')
  const [selected, setSelected]   = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [tracking, setTracking]   = useState('')
  const [updating, setUpdating]   = useState(false)
  const [search, setSearch]       = useState('')

  const fetchOrders = () => {
    setLoading(true)
    ordersAPI.getAll({ status: filter || undefined })
      .then(r => setOrders(r.data.orders || r.data || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchOrders() }, [filter])

  const openModal = (order) => {
    setSelected(order)
    setNewStatus(order.status)
    setTracking(order.trackingNumber || '')
    setModalOpen(true)
  }

  const handleConfirmPayment = async (orderId) => {
    try {
      await ordersAPI.confirm(orderId)
      toast.success('ยืนยันการชำระเงินแล้ว')
      fetchOrders()
    } catch { toast.error('เกิดข้อผิดพลาด') }
  }

  const handleUpdateStatus = async (e) => {
    e.preventDefault()
    setUpdating(true)
    try {
      await ordersAPI.updateStatus(selected._id || selected.id, { status: newStatus, trackingNumber: tracking })
      toast.success('อัปเดตสถานะแล้ว')
      setModalOpen(false)
      fetchOrders()
    } catch { toast.error('เกิดข้อผิดพลาด') }
    finally { setUpdating(false) }
  }

  const filtered = orders.filter(o => {
    if (!search) return true
    const id = (o._id || o.id || '').toLowerCase()
    const name = (o.shippingAddress?.name || '').toLowerCase()
    return id.includes(search.toLowerCase()) || name.includes(search.toLowerCase())
  })

  const stats = [
    { label: 'รอยืนยัน',    value: orders.filter(o => o.status === 'pending').length,    color: 'text-amber-400' },
    { label: 'กำลังเตรียม', value: orders.filter(o => o.status === 'processing').length, color: 'text-orange-400' },
    { label: 'จัดส่งแล้ว',  value: orders.filter(o => o.status === 'shipped').length,    color: 'text-blue-400' },
    { label: 'ส่งมอบแล้ว',  value: orders.filter(o => o.status === 'delivered').length,  color: 'text-emerald-400' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-white mb-1">แผงพนักงาน</h1>
        <p className="font-body text-stone-400 text-sm">จัดการและติดตามคำสั่งซื้อ</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <div key={i} className="bg-stone-900 border border-stone-800 rounded-xl p-5">
            <p className="font-body text-stone-500 text-xs mb-1">{s.label}</p>
            <p className={`font-display font-bold text-3xl ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex flex-wrap gap-2">
          {[{ value: '', label: 'ทั้งหมด' }, ...STATUS_OPTIONS].map(s => (
            <button key={s.value} onClick={() => setFilter(s.value)}
              className={`px-4 py-2 rounded-lg text-sm font-body font-medium transition-colors ${filter === s.value ? 'bg-orange-700 text-white' : 'bg-stone-800 text-stone-400 hover:bg-stone-700'}`}>
              {s.label}
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหา..."
            className="pl-8 pr-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-sm text-stone-200 placeholder-stone-500 font-body focus:outline-none focus:border-orange-600 w-48" />
        </div>
        <button onClick={fetchOrders} className="p-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-400 hover:text-orange-400 transition-colors">
          <RefreshCw size={15} />
        </button>
      </div>

      {loading ? <Spinner /> : (
        <Table headers={['คำสั่งซื้อ', 'ลูกค้า', 'รายการ', 'ยอดรวม', 'สถานะ', 'วันที่', 'จัดการ']}>
          {filtered.map(order => {
            const id = order._id || order.id
            return (
              <Tr key={id}>
                <Td><span className="font-mono text-xs text-orange-400">#{id?.slice(-8).toUpperCase()}</span></Td>
                <Td>
                  <p className="text-stone-200 font-medium">{order.shippingAddress?.name || order.customer?.name || '-'}</p>
                  <p className="text-xs text-stone-500">{order.shippingAddress?.phone}</p>
                </Td>
                <Td><span className="text-stone-400">{order.items?.length || 0} รายการ</span></Td>
                <Td><span className="text-orange-400 font-semibold">฿{order.total?.toLocaleString('th-TH')}</span></Td>
                <Td><OrderStatusBadge status={order.status} /></Td>
                <Td><span className="text-stone-500 text-xs">{new Date(order.createdAt).toLocaleDateString('th-TH')}</span></Td>
                <Td>
                  <div className="flex items-center gap-2">
                    {order.status === 'pending' && (
                      <button onClick={() => handleConfirmPayment(id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-900/50 border border-emerald-700/50 text-emerald-400 hover:bg-emerald-900 rounded-lg text-xs font-body transition-colors">
                        <CheckCircle size={12} />ยืนยัน
                      </button>
                    )}
                    <button onClick={() => openModal(order)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-stone-800 border border-stone-700 text-stone-300 hover:text-orange-400 hover:border-orange-700/50 rounded-lg text-xs font-body transition-colors">
                      <Truck size={12} />อัปเดต
                    </button>
                  </div>
                </Td>
              </Tr>
            )
          })}
        </Table>
      )}

      {/* Update Status Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`อัปเดตคำสั่งซื้อ #${(selected?._id || selected?.id || '').slice(-8).toUpperCase()}`}>
        {selected && (
          <form onSubmit={handleUpdateStatus} className="flex flex-col gap-4">
            <div className="p-4 bg-stone-800/60 rounded-lg">
              <p className="font-body text-sm text-stone-300 font-semibold mb-2">{selected.shippingAddress?.name}</p>
              <p className="font-body text-xs text-stone-500">{selected.shippingAddress?.address}, {selected.shippingAddress?.city}</p>
              <div className="mt-3 flex flex-col gap-1">
                {selected.items?.map((item, i) => (
                  <div key={i} className="flex justify-between text-xs font-body text-stone-400">
                    <span>{item.name} ×{item.quantity}</span>
                    <span>฿{(item.price * item.quantity).toLocaleString('th-TH')}</span>
                  </div>
                ))}
              </div>
            </div>

            <Select label="สถานะคำสั่งซื้อ" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
              {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </Select>

            <Input label="หมายเลขพัสดุ (ถ้ามี)" value={tracking} onChange={e => setTracking(e.target.value)} placeholder="EX1234567890TH" />

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={() => setModalOpen(false)} className="flex-1">ยกเลิก</Button>
              <Button type="submit" variant="primary" loading={updating} className="flex-1">บันทึก</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
