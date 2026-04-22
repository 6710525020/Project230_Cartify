import React, { useEffect, useState } from 'react'
import { Search, RefreshCw, CheckCircle, Truck } from 'lucide-react'
import { ordersAPI } from '../services/api'
import { Button, Spinner, Table, Tr, Td, OrderStatusBadge, Modal, Input, Select, toast } from '../components/UI'

const STATUS_OPTIONS = [
  { value: 'pending',    label: 'รอยืนยัน' },
  { value: 'confirmed',  label: 'ยืนยันแล้ว' },
  { value: 'processing', label: 'กำลังเตรียม' },
  { value: 'shipped',    label: 'จัดส่งแล้ว' },
  { value: 'delivered',  label: 'ได้รับแล้ว' },
  { value: 'cancelled',  label: 'ยกเลิก' },
]

export default function StaffPage() {
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('')
  const [search, setSearch]   = useState('')
  const [selected, setSelected] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [tracking, setTracking]   = useState('')
  const [updating, setUpdating]   = useState(false)

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

  const handleConfirmPayment = async (id) => {
    try {
      await ordersAPI.confirm(id)
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
    return (o._id || o.id || '').includes(search) || (o.shippingAddress?.name || '').toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div className="mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="mb-1 font-display font-black text-brown-900 text-3xl">Order Management</h1>
        <p className="font-body text-brown-400 text-sm">จัดการและติดตามคำสั่งซื้อ</p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        {[{ value: '', label: 'ทั้งหมด' }, ...STATUS_OPTIONS].map(s => (
          <button key={s.value} onClick={() => setFilter(s.value)}
            className={`px-4 py-2 rounded-xl text-sm font-display font-bold transition-colors ${filter === s.value ? 'bg-brown-800 text-white shadow-btn' : 'bg-white text-brown-600 hover:bg-cream-300 shadow-card'}`}>
            {s.label}
          </button>
        ))}
        <div className="relative ml-auto">
          <Search size={14} className="top-1/2 left-3 absolute text-brown-400 -translate-y-1/2" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหา..."
            className="bg-white py-2 pr-3 pl-8 border-2 border-cream-400 focus:border-brown-700 rounded-xl focus:outline-none w-44 font-body text-brown-900 text-sm placeholder-brown-300" />
        </div>
        <button onClick={fetchOrders} className="bg-white shadow-card p-2 border-2 border-cream-400 hover:border-brown-400 rounded-xl text-brown-500 hover:text-brown-800 transition-colors">
          <RefreshCw size={15} />
        </button>
      </div>

      {loading ? <Spinner /> : (
        <Table headers={['Order ID', 'ลูกค้า', 'รายการ', 'ยอดรวม', 'สถานะ', 'วันที่', 'จัดการ']}>
          {filtered.map(order => {
            const id = order._id || order.id
            return (
              <Tr key={id}>
                <Td><span className="font-mono text-brown-500 text-xs">#{id?.slice(-8).toUpperCase()}</span></Td>
                <Td>
                  <p className="font-display font-bold text-brown-800">{order.shippingAddress?.name || '-'}</p>
                  <p className="text-brown-400 text-xs">{order.shippingAddress?.phone}</p>
                </Td>
                <Td><span className="text-brown-500">{order.items?.length || 0} รายการ</span></Td>
                <Td><span className="font-display font-extrabold text-brown-900">฿{order.total?.toLocaleString('th-TH')}</span></Td>
                <Td><OrderStatusBadge status={order.status} /></Td>
                <Td><span className="text-brown-400 text-xs">{new Date(order.createdAt).toLocaleDateString('th-TH')}</span></Td>
                <Td>
                  <div className="flex gap-2">
                    {order.status === 'pending' && (
                      <button onClick={() => handleConfirmPayment(id)}
                        className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-xl font-display font-bold text-white text-xs transition-colors">
                        <CheckCircle size={12} />ยืนยัน
                      </button>
                    )}
                    <button onClick={() => openModal(order)}
                      className="flex items-center gap-1 bg-white hover:bg-cream-200 px-3 py-1.5 border-2 border-cream-400 rounded-xl font-display font-bold text-brown-700 text-xs transition-colors">
                      <Truck size={12} />อัปเดต
                    </button>
                  </div>
                </Td>
              </Tr>
            )
          })}
        </Table>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`อัปเดตคำสั่งซื้อ #${(selected?._id || selected?.id || '').slice(-8).toUpperCase()}`}>
        {selected && (
          <form onSubmit={handleUpdateStatus} className="flex flex-col gap-4">
            <div className="bg-cream-200 p-4 rounded-2xl">
              <p className="font-display font-bold text-brown-800 text-sm">{selected.shippingAddress?.name}</p>
              <p className="mt-0.5 font-body text-brown-500 text-xs">{selected.shippingAddress?.address}</p>
            </div>
            <Select label="สถานะ" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
              {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </Select>
            <Input label="หมายเลขพัสดุ" value={tracking} onChange={e => setTracking(e.target.value)} placeholder="EX1234567890TH" />
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
