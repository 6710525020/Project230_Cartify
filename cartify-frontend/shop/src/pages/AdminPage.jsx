import React, { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Users, Package, ShoppingBag, Search, X } from 'lucide-react'
import { productsAPI, customersAPI, ordersAPI } from '../services/api'
import { Button, Input, Select, Spinner, Table, Tr, Td, Modal, Badge, OrderStatusBadge, toast } from '../components/UI'

function productName(product) {
  return product.name || product.pname || ''
}

function productPayload(form) {
  return {
    ...form,
    name: form.name,
    pname: form.name,
    price: Number(form.price),
    stock: Number(form.stock),
  }
}

function customerName(customer) {
  return customer.name || customer.cname || ''
}

function customerKey(customer) {
  return customer._id || customer.id || customer.customer_id
}

function orderKey(order) {
  return order._id || order.id || order.order_id
}

function orderCustomer(order) {
  return order.customerName || order.cname || order.customer_name || order.shippingAddress?.name || '-'
}

function orderCreatedAt(order) {
  return order.createdAt || order.orderDate || order.order_date || null
}

function orderItemsSummary(order) {
  if (!Array.isArray(order.items) || order.items.length === 0) return 'No items'
  return order.items
    .map((item) => `${item.name || 'Unnamed product'} x${item.quantity || 0}`)
    .join(', ')
}

const ORDER_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'payment_completed', label: 'Payment completed' },
  { value: 'shipping_in_progress', label: 'Shipping in progress' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

function ProductForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(() => ({
    name: initial?.name || initial?.pname || '',
    description: initial?.description || '',
    price: initial?.price ?? '',
    stock: initial?.stock ?? '',
    category: initial?.category || '',
    image: initial?.image || initial?.imageUrl || '',
  }))
  const [saving, setSaving] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const f = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

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
      setForm((prev) => ({ ...prev, image: reader.result }))
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const data = productPayload(form)
      if (initial?._id || initial?.id) {
        await productsAPI.update(initial._id || initial.id, data)
        toast.success('Product updated')
      } else {
        await productsAPI.create(data)
        toast.success('Product created')
      }
      onSave()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input label="Product Name" required value={form.name} onChange={f('name')} />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Price" type="number" required min="0" value={form.price} onChange={f('price')} />
        <Input label="Stock" type="number" required min="0" value={form.stock} onChange={f('stock')} />
      </div>
      <Input label="Category" value={form.category} onChange={f('category')} />
      <div className="flex flex-col gap-2">
        <Input label="Attach Image File" type="file" accept="image/*" onChange={handleFileChange} />
        {uploadError && <p className="font-body text-red-500 text-xs">{uploadError}</p>}
        {form.image && (
          <div className="h-24 w-24 overflow-hidden rounded-xl border border-cream-300 bg-cream-200">
            <img src={form.image} alt="Preview" className="h-full w-full object-cover" />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="font-display font-bold text-brown-700 text-sm">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          rows={3}
          className="w-full resize-none rounded-xl border-2 border-cream-400 bg-white px-4 py-3 font-body text-brown-900 text-sm focus:border-brown-700 focus:outline-none"
        />
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={saving} className="flex-1">
          {initial ? 'Save' : 'Add Product'}
        </Button>
      </div>
    </form>
  )
}

export default function AdminPage() {
  const [tab, setTab] = useState('products')
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState({ open: false, type: null, data: null })
  const [delConfirm, setDelConfirm] = useState(null)
  const [orderModal, setOrderModal] = useState({ open: false, order: null, status: 'pending' })
  const [savingOrderStatus, setSavingOrderStatus] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      if (tab === 'products') {
        const response = await productsAPI.getAll({ limit: 100 })
        setProducts(response.data.products || response.data || [])
      } else if (tab === 'customers') {
        const response = await customersAPI.getAll()
        setCustomers(response.data.customers || response.data || [])
      } else {
        const response = await ordersAPI.getAll({ limit: 100 })
        setOrders(response.data.orders || response.data || [])
      }
    } catch {
      if (tab === 'products') setProducts([])
      if (tab === 'customers') setCustomers([])
      if (tab === 'orders') setOrders([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [tab])

  const handleDelete = async (id) => {
    try {
      if (tab === 'products') {
        await productsAPI.delete(id)
        toast.success('Product deleted')
      } else if (tab === 'orders') {
        await ordersAPI.delete(id)
        toast.success('Order deleted')
      } else {
        await customersAPI.delete(id)
        toast.success('Customer deleted')
      }
      setDelConfirm(null)
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Something went wrong')
    }
  }

  const openOrderModal = (order) => {
    setOrderModal({
      open: true,
      order,
      status: order.status || 'pending',
    })
  }

  const handleOrderStatusSave = async (e) => {
    e.preventDefault()
    if (!orderModal.order) return

    setSavingOrderStatus(true)
    try {
      await ordersAPI.updateStatus(orderKey(orderModal.order), orderModal.status)
      toast.success('Order status updated')
      setOrderModal({ open: false, order: null, status: 'pending' })
      fetchData()
    } catch {
      toast.error('Failed to update order status')
    } finally {
      setSavingOrderStatus(false)
    }
  }

  const tabs = [
    { key: 'products', label: 'Product Management', icon: Package },
    { key: 'customers', label: 'Customers', icon: Users },
    { key: 'orders', label: 'Orders', icon: ShoppingBag },
  ]

  const normalizedSearch = search.trim().toLowerCase()
  const filteredProducts = products.filter((product) => productName(product).toLowerCase().includes(normalizedSearch))
  const filteredCustomers = customers.filter((customer) => (
    customerName(customer).toLowerCase().includes(normalizedSearch) ||
    String(customer.email || '').toLowerCase().includes(normalizedSearch)
  ))
  const filteredOrders = orders.filter((order) => (
    String(orderKey(order) || '').toLowerCase().includes(normalizedSearch) ||
    orderCustomer(order).toLowerCase().includes(normalizedSearch) ||
    String(order.customerEmail || '').toLowerCase().includes(normalizedSearch) ||
    orderItemsSummary(order).toLowerCase().includes(normalizedSearch)
  ))

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 font-display font-black text-3xl text-brown-900">
        {tabs.find((item) => item.key === tab)?.label}
      </h1>

      <div className="mb-6 flex items-center gap-2">
        {tabs.map((item) => (
          <button
            key={item.key}
            onClick={() => {
              setTab(item.key)
              setSearch('')
            }}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 font-display font-bold text-sm transition-all ${
              tab === item.key ? 'bg-brown-800 text-white shadow-btn' : 'bg-white text-brown-600 shadow-card hover:bg-cream-300'
            }`}
          >
            <item.icon size={15} />
            {item.label}
          </button>
        ))}
      </div>

      <div className="mb-5 flex items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brown-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full rounded-xl border-2 border-cream-400 bg-white py-2.5 pl-8 pr-3 font-body text-brown-900 text-sm placeholder-brown-300 focus:border-brown-700 focus:outline-none"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-brown-400">
              <X size={13} />
            </button>
          )}
        </div>
        {tab === 'products' && (
          <Button variant="primary" onClick={() => setModal({ open: true, type: 'add', data: null })}>
            <Plus size={15} />
            Add Product
          </Button>
        )}
      </div>

      {loading ? <Spinner /> : (
        <>
          {tab === 'products' && (
            <div className="overflow-hidden rounded-2xl bg-white shadow-card">
              <div className="grid grid-cols-6 border-b border-cream-300 bg-cream-200 px-5 py-3.5">
                {['Image', 'Product Name', 'Category', 'Price', 'Stock', 'Manage'].map((header) => (
                  <span key={header} className="font-display font-extrabold text-brown-700 text-sm">
                    {header}
                  </span>
                ))}
              </div>
              {filteredProducts.map((product) => (
                <div key={product._id || product.id} className="grid grid-cols-6 items-center border-b border-cream-200 px-5 py-4 hover:bg-cream-50">
                  <div className="h-10 w-10 overflow-hidden rounded-xl bg-cream-200">
                    {product.image ? (
                      <img src={product.image} alt={productName(product)} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xl text-brown-300">P</div>
                    )}
                  </div>
                  <span className="font-display font-bold text-brown-800 text-sm">{productName(product)}</span>
                  <span>{product.category ? <Badge color="yellow">{product.category}</Badge> : <span className="text-brown-300">-</span>}</span>
                  <span className="font-display font-extrabold text-brown-900">THB {Number(product.price || 0).toLocaleString('th-TH')}</span>
                  <span className={`font-display font-bold text-sm ${product.stock === 0 ? 'text-red-500' : product.stock < 5 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {product.stock}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => setModal({ open: true, type: 'edit', data: product })} className="p-1.5 text-brown-400 transition-colors hover:text-brown-700">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setDelConfirm(product._id || product.id)} className="p-1.5 text-brown-400 transition-colors hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'customers' && (
            <div className="overflow-hidden rounded-2xl bg-white shadow-card">
              <div className="grid grid-cols-5 border-b border-cream-300 bg-cream-200 px-5 py-3.5">
                {['Name', 'Email', 'Joined', 'Orders', 'Manage'].map((header) => (
                  <span key={header} className="font-display font-extrabold text-brown-700 text-sm">
                    {header}
                  </span>
                ))}
              </div>
              {filteredCustomers.map((customer) => (
                <div key={customerKey(customer)} className="grid grid-cols-5 items-center border-b border-cream-200 px-5 py-4 hover:bg-cream-50">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brown-800 font-bold text-gold-400 text-xs">
                      {customerName(customer)?.[0]?.toUpperCase()}
                    </div>
                    <span className="font-display font-bold text-brown-800 text-sm">{customerName(customer)}</span>
                  </div>
                  <span className="text-brown-500 text-sm">{customer.email}</span>
                  <span className="text-brown-400 text-xs">
                    {customer.createdAt || customer.created_at ? new Date(customer.createdAt || customer.created_at).toLocaleDateString('th-TH') : '-'}
                  </span>
                  <span className="text-brown-500 text-sm">{customer.orderCount || 0}</span>
                  <button onClick={() => setDelConfirm(customerKey(customer))} className="w-fit p-1.5 text-brown-400 transition-colors hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {tab === 'orders' && (
            <Table headers={['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Date', 'Manage']}>
              {filteredOrders.map((order) => {
                const id = orderKey(order)
                const createdAt = orderCreatedAt(order)
                return (
                  <Tr key={id}>
                    <Td><span className="font-mono text-brown-500 text-xs">#{String(id || '').slice(-8).toUpperCase()}</span></Td>
                    <Td>
                      <div className="space-y-1">
                        <p className="font-display font-bold text-brown-800">{orderCustomer(order)}</p>
                        <p className="text-brown-500 text-xs">{order.customerEmail || order.shippingAddress?.phone || '-'}</p>
                      </div>
                    </Td>
                    <Td>
                      <div className="max-w-xs space-y-1">
                        {order.items?.length ? order.items.slice(0, 2).map((item, index) => (
                          <p key={`${item.product_id || item.name}-${index}`} className="text-brown-500 text-sm">
                            {item.name} x{item.quantity}
                          </p>
                        )) : <span className="text-brown-300 text-sm">No items</span>}
                        {(order.items?.length || 0) > 2 && (
                          <p className="text-brown-400 text-xs">+{order.items.length - 2} more items</p>
                        )}
                      </div>
                    </Td>
                    <Td><span className="font-display font-extrabold text-brown-900">THB {Number(order.total ?? order.total_price ?? 0).toLocaleString('th-TH')}</span></Td>
                    <Td><OrderStatusBadge status={order.status} /></Td>
                    <Td><span className="text-brown-400 text-xs">{createdAt ? new Date(createdAt).toLocaleDateString('th-TH') : '-'}</span></Td>
                    <Td>
                      <div className="flex gap-2">
                        <Button variant="secondary" size="sm" onClick={() => openOrderModal(order)}>
                          Update Status
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => setDelConfirm(id)}>
                          Delete
                        </Button>
                      </div>
                    </Td>
                  </Tr>
                )
              })}
            </Table>
          )}
        </>
      )}

      <Modal
        open={modal.open && (modal.type === 'add' || modal.type === 'edit')}
        onClose={() => setModal({ open: false, type: null, data: null })}
        title={modal.type === 'edit' ? 'Edit Product' : 'Add Product'}
      >
        <ProductForm
          initial={modal.data}
          onSave={() => {
            setModal({ open: false, type: null, data: null })
            fetchData()
          }}
          onClose={() => setModal({ open: false, type: null, data: null })}
        />
      </Modal>

      <Modal open={!!delConfirm} onClose={() => setDelConfirm(null)} title="Confirm Delete" size="sm">
        <p className="mb-6 font-body text-brown-600 text-sm">
          {tab === 'orders'
            ? 'Are you sure you want to delete this order?'
            : tab === 'products'
              ? 'Are you sure you want to delete this product?'
              : 'Are you sure you want to delete this customer?'}
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setDelConfirm(null)} className="flex-1">
            Cancel
          </Button>
          <Button variant="danger" onClick={() => handleDelete(delConfirm)} className="flex-1">
            Delete
          </Button>
        </div>
      </Modal>

      <Modal
        open={orderModal.open}
        onClose={() => setOrderModal({ open: false, order: null, status: 'pending' })}
        title={`Update Order #${String(orderKey(orderModal.order || {}) || '').slice(-8).toUpperCase()}`}
        size="sm"
      >
        {orderModal.order && (
          <form onSubmit={handleOrderStatusSave} className="flex flex-col gap-4">
            <div className="rounded-2xl bg-cream-200 p-4">
              <p className="font-display font-bold text-brown-800 text-sm">{orderCustomer(orderModal.order)}</p>
              <p className="mt-1 font-body text-brown-500 text-xs">{orderModal.order.customerEmail || orderModal.order.shippingAddress?.phone || '-'}</p>
              <p className="mt-1 font-body text-brown-500 text-xs">{orderModal.order.shippingAddress?.address || '-'}</p>
            </div>
            <div className="rounded-2xl border border-cream-300 bg-white p-4">
              <p className="mb-3 font-display font-bold text-brown-800 text-sm">Ordered Items</p>
              <div className="space-y-2">
                {orderModal.order.items?.length ? orderModal.order.items.map((item, index) => (
                  <div key={`${item.product_id || item.name}-${index}`} className="flex items-start justify-between gap-3 text-sm">
                    <div>
                      <p className="font-body font-semibold text-brown-700">{item.name}</p>
                      <p className="text-brown-400">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-display font-bold text-brown-900">
                      THB {Number((item.price || 0) * (item.quantity || 0)).toLocaleString('th-TH')}
                    </p>
                  </div>
                )) : <p className="text-brown-400 text-sm">No items found for this order.</p>}
              </div>
            </div>
            <Select
              label="Order Status"
              value={orderModal.status}
              onChange={(e) => setOrderModal((prev) => ({ ...prev, status: e.target.value }))}
            >
              {ORDER_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Select>
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setOrderModal({ open: false, order: null, status: 'pending' })}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={savingOrderStatus} className="flex-1">
                Save
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
