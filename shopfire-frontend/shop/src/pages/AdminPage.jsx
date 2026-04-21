// src/pages/AdminPage.jsx — ผู้ดูแลระบบ
import React, { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Users, Package, ShoppingBag, Search, X } from 'lucide-react'
import { productsAPI, customersAPI, ordersAPI } from '../services/api'
import { Button, Input, Select, Spinner, Table, Tr, Td, Modal, Badge, OrderStatusBadge, toast } from '../components/UI'

// ── Product Form ───────────────────────────────────────
function ProductForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || { name: '', description: '', price: '', stock: '', category: '', image: '' })
  const [saving, setSaving] = useState(false)
  const f = (k) => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const data = { ...form, price: Number(form.price), stock: Number(form.stock) }
      if (initial?._id || initial?.id) {
        await productsAPI.update(initial._id || initial.id, data)
        toast.success('แก้ไขสินค้าแล้ว')
      } else {
        await productsAPI.create(data)
        toast.success('เพิ่มสินค้าแล้ว')
      }
      onSave()
    } catch { toast.error('เกิดข้อผิดพลาด') }
    finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input label="ชื่อสินค้า" required value={form.name} onChange={f('name')} />
      <div className="grid grid-cols-2 gap-4">
        <Input label="ราคา (บาท)" type="number" required min="0" value={form.price} onChange={f('price')} />
        <Input label="จำนวนสต็อก" type="number" required min="0" value={form.stock} onChange={f('stock')} />
      </div>
      <Input label="หมวดหมู่" value={form.category} onChange={f('category')} />
      <Input label="URL รูปภาพ" value={form.image} onChange={f('image')} placeholder="https://..." />
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-stone-300 font-body">คำอธิบาย</label>
        <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3}
          className="w-full px-4 py-2.5 bg-stone-900 border border-stone-700 rounded-lg text-stone-100 placeholder-stone-500 font-body text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-600 resize-none" />
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onClose} className="flex-1">ยกเลิก</Button>
        <Button type="submit" variant="primary" loading={saving} className="flex-1">{initial ? 'บันทึก' : 'เพิ่มสินค้า'}</Button>
      </div>
    </form>
  )
}

// ── Main Component ─────────────────────────────────────
export default function AdminPage() {
  const [tab, setTab]           = useState('products')
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [orders, setOrders]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [modal, setModal]       = useState({ open: false, type: null, data: null })
  const [delConfirm, setDelConfirm] = useState(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      if (tab === 'products') {
        const r = await productsAPI.getAll({ limit: 100 })
        setProducts(r.data.products || r.data || [])
      } else if (tab === 'customers') {
        const r = await customersAPI.getAll()
        setCustomers(r.data.customers || r.data || [])
      } else if (tab === 'orders') {
        const r = await ordersAPI.getAll({ limit: 100 })
        setOrders(r.data.orders || r.data || [])
      }
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [tab])

  const handleDelete = async (id) => {
    try {
      if (tab === 'products') { await productsAPI.delete(id); toast.success('ลบสินค้าแล้ว') }
      else if (tab === 'customers') { await customersAPI.delete(id); toast.success('ลบลูกค้าแล้ว') }
      setDelConfirm(null)
      fetchData()
    } catch { toast.error('เกิดข้อผิดพลาด') }
  }

  const tabs = [
    { key: 'products',  label: 'สินค้า',     icon: Package },
    { key: 'customers', label: 'ลูกค้า',     icon: Users },
    { key: 'orders',    label: 'คำสั่งซื้อ', icon: ShoppingBag },
  ]

  const filteredProducts = products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase()))
  const filteredCustomers = customers.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase()))
  const filteredOrders    = orders.filter(o => (o._id || o.id || '').includes(search) || o.shippingAddress?.name?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-white mb-1">แผงผู้ดูแลระบบ</h1>
        <p className="font-body text-stone-400 text-sm">จัดการสินค้า ลูกค้า และคำสั่งซื้อ</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 bg-stone-900 border border-stone-800 rounded-xl p-1 w-fit">
        {tabs.map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); setSearch('') }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-body font-medium transition-all ${tab === t.key ? 'bg-orange-700 text-white shadow-fire' : 'text-stone-400 hover:text-stone-200'}`}>
            <t.icon size={15} />{t.label}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหา..."
            className="w-full pl-8 pr-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-sm text-stone-200 placeholder-stone-500 font-body focus:outline-none focus:border-orange-600" />
          {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"><X size={13} /></button>}
        </div>
        {tab === 'products' && (
          <Button variant="primary" onClick={() => setModal({ open: true, type: 'add', data: null })}>
            <Plus size={15} />เพิ่มสินค้า
          </Button>
        )}
      </div>

      {loading ? <Spinner /> : (
        <>
          {/* Products Table */}
          {tab === 'products' && (
            <Table headers={['รูป', 'ชื่อสินค้า', 'หมวดหมู่', 'ราคา', 'สต็อก', 'จัดการ']}>
              {filteredProducts.map(p => (
                <Tr key={p._id || p.id}>
                  <Td>
                    <div className="w-10 h-10 rounded-lg bg-stone-800 overflow-hidden">
                      {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl">📦</div>}
                    </div>
                  </Td>
                  <Td><span className="font-medium text-stone-200">{p.name}</span></Td>
                  <Td>{p.category ? <Badge color="orange">{p.category}</Badge> : <span className="text-stone-600">-</span>}</Td>
                  <Td><span className="text-orange-400 font-semibold">฿{p.price?.toLocaleString('th-TH')}</span></Td>
                  <Td><span className={p.stock === 0 ? 'text-red-400' : p.stock < 5 ? 'text-amber-400' : 'text-emerald-400'}>{p.stock}</span></Td>
                  <Td>
                    <div className="flex gap-2">
                      <button onClick={() => setModal({ open: true, type: 'edit', data: p })} className="p-1.5 text-stone-500 hover:text-orange-400 transition-colors"><Pencil size={14} /></button>
                      <button onClick={() => setDelConfirm(p._id || p.id)} className="p-1.5 text-stone-500 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </Td>
                </Tr>
              ))}
            </Table>
          )}

          {/* Customers Table */}
          {tab === 'customers' && (
            <Table headers={['ชื่อ', 'อีเมล', 'วันที่สมัคร', 'จำนวนคำสั่งซื้อ', 'จัดการ']}>
              {filteredCustomers.map(c => (
                <Tr key={c._id || c.id}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-700 to-red-800 flex items-center justify-center text-xs font-bold text-white">{c.name?.[0]?.toUpperCase()}</div>
                      <span className="font-medium text-stone-200">{c.name}</span>
                    </div>
                  </Td>
                  <Td><span className="text-stone-400">{c.email}</span></Td>
                  <Td><span className="text-stone-500 text-xs">{c.createdAt ? new Date(c.createdAt).toLocaleDateString('th-TH') : '-'}</span></Td>
                  <Td><span className="text-stone-400">{c.orderCount || 0} คำสั่ง</span></Td>
                  <Td>
                    <button onClick={() => setDelConfirm(c._id || c.id)} className="p-1.5 text-stone-500 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                  </Td>
                </Tr>
              ))}
            </Table>
          )}

          {/* Orders Table */}
          {tab === 'orders' && (
            <Table headers={['รหัส', 'ลูกค้า', 'รายการ', 'ยอดรวม', 'สถานะ', 'วันที่']}>
              {filteredOrders.map(o => {
                const id = o._id || o.id
                return (
                  <Tr key={id}>
                    <Td><span className="font-mono text-xs text-orange-400">#{id?.slice(-8).toUpperCase()}</span></Td>
                    <Td>
                      <p className="text-stone-200">{o.shippingAddress?.name || '-'}</p>
                      <p className="text-xs text-stone-500">{o.shippingAddress?.phone}</p>
                    </Td>
                    <Td><span className="text-stone-400">{o.items?.length || 0} รายการ</span></Td>
                    <Td><span className="text-orange-400 font-semibold">฿{o.total?.toLocaleString('th-TH')}</span></Td>
                    <Td><OrderStatusBadge status={o.status} /></Td>
                    <Td><span className="text-stone-500 text-xs">{new Date(o.createdAt).toLocaleDateString('th-TH')}</span></Td>
                  </Tr>
                )
              })}
            </Table>
          )}
        </>
      )}

      {/* Add/Edit Product Modal */}
      <Modal open={modal.open && (modal.type === 'add' || modal.type === 'edit')} onClose={() => setModal({ open: false })}
        title={modal.type === 'edit' ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'} size="md">
        <ProductForm initial={modal.data} onSave={() => { setModal({ open: false }); fetchData() }} onClose={() => setModal({ open: false })} />
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal open={!!delConfirm} onClose={() => setDelConfirm(null)} title="ยืนยันการลบ" size="sm">
        <p className="font-body text-stone-300 text-sm mb-6">คุณแน่ใจหรือไม่ที่จะลบรายการนี้? การดำเนินการนี้ไม่สามารถยกเลิกได้</p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setDelConfirm(null)} className="flex-1">ยกเลิก</Button>
          <Button variant="danger" onClick={() => handleDelete(delConfirm)} className="flex-1">ลบ</Button>
        </div>
      </Modal>
    </div>
  )
}
