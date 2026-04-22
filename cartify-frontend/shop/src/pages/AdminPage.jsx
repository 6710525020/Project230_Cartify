import React, { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Users, Package, ShoppingBag, Search, X } from 'lucide-react'
import { productsAPI, customersAPI, ordersAPI } from '../services/api'
import { Button, Input, Select, Spinner, Table, Tr, Td, Modal, Badge, OrderStatusBadge, toast } from '../components/UI'

function ProductForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || { name: '', description: '', price: '', stock: '', category: '', image: '' })
  const [saving, setSaving] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file only')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('Image file must be 2MB or smaller')
      return
    }

    setUploadError('')
    const reader = new FileReader()
    reader.onload = () => {
      setForm((p) => ({ ...p, image: reader.result }))
    }
    reader.readAsDataURL(file)
  }

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
      <div className="gap-4 grid grid-cols-2">
        <Input label="ราคา (บาท)" type="number" required min="0" value={form.price} onChange={f('price')} />
        <Input label="จำนวนสต็อก" type="number" required min="0" value={form.stock} onChange={f('stock')} />
      </div>
      <Input label="หมวดหมู่" value={form.category} onChange={f('category')} />
      <div className="flex flex-col gap-2">
        <Input label="Attach Image File" type="file" accept="image/*" onChange={handleFileChange} />
        {uploadError && <p className="font-body text-red-500 text-xs">{uploadError}</p>}
        {form.image && (
          <div className="bg-cream-200 border border-cream-300 rounded-xl w-24 h-24 overflow-hidden">
            <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="font-display font-bold text-brown-700 text-sm">คำอธิบาย</label>
        <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3}
          className="bg-white px-4 py-3 border-2 border-cream-400 focus:border-brown-700 rounded-xl focus:outline-none w-full font-body text-brown-900 text-sm resize-none" />
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onClose} className="flex-1">ยกเลิก</Button>
        <Button type="submit" variant="primary" loading={saving} className="flex-1">{initial ? 'บันทึก' : 'Add Product'}</Button>
      </div>
    </form>
  )
}

export default function AdminPage() {
  const [tab, setTab] = useState('products')
  const [products, setProducts]   = useState([])
  const [customers, setCustomers] = useState([])
  const [orders, setOrders]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [modal, setModal]         = useState({ open: false, type: null, data: null })
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
      } else {
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
      else { await customersAPI.delete(id); toast.success('ลบลูกค้าแล้ว') }
      setDelConfirm(null)
      fetchData()
    } catch { toast.error('เกิดข้อผิดพลาด') }
  }

  const tabs = [
    { key: 'products',  label: 'Product Management', icon: Package },
    { key: 'customers', label: 'Customers', icon: Users },
    { key: 'orders',    label: 'Orders',    icon: ShoppingBag },
  ]

  const filteredProducts  = products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()))
  const filteredCustomers = customers.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase()))
  const filteredOrders    = orders.filter(o => (o._id || o.id || '').includes(search) || o.shippingAddress?.name?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="mx-auto px-4 py-8 max-w-6xl">
      {/* Title shows current tab page name like screenshots */}
      <h1 className="mb-6 font-display font-black text-brown-900 text-3xl">{tabs.find(t=>t.key===tab)?.label}</h1>

      {/* Tab nav */}
      <div className="flex items-center gap-2 mb-6">
        {tabs.map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); setSearch('') }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-display font-bold transition-all ${tab === t.key ? 'bg-brown-800 text-white shadow-btn' : 'bg-white text-brown-600 hover:bg-cream-300 shadow-card'}`}>
            <t.icon size={15} />{t.label}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="top-1/2 left-3 absolute text-brown-400 -translate-y-1/2" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหา..."
            className="bg-white py-2.5 pr-3 pl-8 border-2 border-cream-400 focus:border-brown-700 rounded-xl focus:outline-none w-full font-body text-brown-900 text-sm placeholder-brown-300" />
          {search && <button onClick={() => setSearch('')} className="top-1/2 right-2 absolute text-brown-400 -translate-y-1/2"><X size={13} /></button>}
        </div>
        {tab === 'products' && (
          <Button variant="primary" onClick={() => setModal({ open: true, type: 'add', data: null })}>
            <Plus size={15} />Add Product
          </Button>
        )}
      </div>

      {loading ? <Spinner /> : (
        <>
          {tab === 'products' && (
            <div className="bg-white shadow-card rounded-2xl overflow-hidden">
              <div className="grid grid-cols-6 bg-cream-200 px-5 py-3.5 border-cream-300 border-b">
                {['รูป','ชื่อสินค้า','หมวดหมู่','ราคา','สต็อก','จัดการ'].map(h => (
                  <span key={h} className="font-display font-extrabold text-brown-700 text-sm">{h}</span>
                ))}
              </div>
              {filteredProducts.map(p => (
                <div key={p._id || p.id} className="items-center grid grid-cols-6 hover:bg-cream-50 px-5 py-4 border-cream-200 border-b">
                  <div className="bg-cream-200 rounded-xl w-10 h-10 overflow-hidden">
                    {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : <div className="flex justify-center items-center w-full h-full text-xl">📦</div>}
                  </div>
                  <span className="font-display font-bold text-brown-800 text-sm">{p.name}</span>
                  <span>{p.category ? <Badge color="yellow">{p.category}</Badge> : <span className="text-brown-300">-</span>}</span>
                  <span className="font-display font-extrabold text-brown-900">฿{p.price?.toLocaleString('th-TH')}</span>
                  <span className={`font-display font-bold text-sm ${p.stock === 0 ? 'text-red-500' : p.stock < 5 ? 'text-amber-600' : 'text-emerald-600'}`}>{p.stock}</span>
                  <div className="flex gap-2">
                    <button onClick={() => setModal({ open: true, type: 'edit', data: p })} className="p-1.5 text-brown-400 hover:text-brown-700 transition-colors"><Pencil size={14} /></button>
                    <button onClick={() => setDelConfirm(p._id || p.id)} className="p-1.5 text-brown-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'customers' && (
            <div className="bg-white shadow-card rounded-2xl overflow-hidden">
              <div className="grid grid-cols-5 bg-cream-200 px-5 py-3.5 border-cream-300 border-b">
                {['ชื่อ','อีเมล','วันสมัคร','คำสั่งซื้อ','จัดการ'].map(h => (
                  <span key={h} className="font-display font-extrabold text-brown-700 text-sm">{h}</span>
                ))}
              </div>
              {filteredCustomers.map(c => (
                <div key={c._id || c.id} className="items-center grid grid-cols-5 hover:bg-cream-50 px-5 py-4 border-cream-200 border-b">
                  <div className="flex items-center gap-2">
                    <div className="flex justify-center items-center bg-brown-800 rounded-full w-8 h-8 font-bold text-gold-400 text-xs">{c.name?.[0]?.toUpperCase()}</div>
                    <span className="font-display font-bold text-brown-800 text-sm">{c.name}</span>
                  </div>
                  <span className="text-brown-500 text-sm">{c.email}</span>
                  <span className="text-brown-400 text-xs">{c.createdAt ? new Date(c.createdAt).toLocaleDateString('th-TH') : '-'}</span>
                  <span className="text-brown-500 text-sm">{c.orderCount || 0}</span>
                  <button onClick={() => setDelConfirm(c._id || c.id)} className="p-1.5 w-fit text-brown-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          )}

          {tab === 'orders' && (
            <Table headers={['รหัส','ลูกค้า','รายการ','ยอดรวม','สถานะ','วันที่']}>
              {filteredOrders.map(o => {
                const id = o._id || o.id
                return (
                  <Tr key={id}>
                    <Td><span className="font-mono text-brown-500 text-xs">#{id?.slice(-8).toUpperCase()}</span></Td>
                    <Td><span className="font-display font-bold text-brown-800">{o.shippingAddress?.name || '-'}</span></Td>
                    <Td><span className="text-brown-500">{o.items?.length || 0} รายการ</span></Td>
                    <Td><span className="font-display font-extrabold text-brown-900">฿{o.total?.toLocaleString('th-TH')}</span></Td>
                    <Td><OrderStatusBadge status={o.status} /></Td>
                    <Td><span className="text-brown-400 text-xs">{new Date(o.createdAt).toLocaleDateString('th-TH')}</span></Td>
                  </Tr>
                )
              })}
            </Table>
          )}
        </>
      )}

      <Modal open={modal.open && (modal.type === 'add' || modal.type === 'edit')} onClose={() => setModal({ open: false })}
        title={modal.type === 'edit' ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}>
        <ProductForm initial={modal.data} onSave={() => { setModal({ open: false }); fetchData() }} onClose={() => setModal({ open: false })} />
      </Modal>

      <Modal open={!!delConfirm} onClose={() => setDelConfirm(null)} title="ยืนยันการลบ" size="sm">
        <p className="mb-6 font-body text-brown-600 text-sm">คุณแน่ใจหรือไม่ที่จะลบรายการนี้?</p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setDelConfirm(null)} className="flex-1">ยกเลิก</Button>
          <Button variant="danger" onClick={() => handleDelete(delConfirm)} className="flex-1">ลบ</Button>
        </div>
      </Modal>
    </div>
  )
}
