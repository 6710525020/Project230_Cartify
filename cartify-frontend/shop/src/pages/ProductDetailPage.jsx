import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Minus, Pencil, Plus, RefreshCw, Shield, Truck } from 'lucide-react'
import { productsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { Button, Input, Modal, Spinner, toast } from '../components/UI'

function toFormState(product) {
  return {
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price ?? '',
    stock: product?.stock ?? '',
    category: product?.category || '',
    image: product?.image || product?.imageUrl || '',
  }
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addItem } = useCart()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [adding, setAdding] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [form, setForm] = useState(toFormState(null))

  useEffect(() => {
    setLoading(true)
    productsAPI.getOne(id)
      .then((response) => {
        setProduct(response.data)
        setForm(toFormState(response.data))
        setQty(1)
      })
      .catch(() => navigate('/products'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  const canEditProduct = user?.role === 'admin' || user?.role === 'manager'
  const isCustomer = user?.role === 'customer'
  const productId = product?._id || product?.id
  const imageSrc = product?.image || product?.imageUrl
  const stockValue = Number(product?.stock || 0)
  const stockLabel = stockValue > 0 ? `${stockValue} in stock` : 'Out of stock'
  const stockClasses = stockValue > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'

  const openEditModal = () => {
    setForm(toFormState(product))
    setUploadError('')
    setEditOpen(true)
  }

  const closeEditModal = () => {
    setForm(toFormState(product))
    setUploadError('')
    setEditOpen(false)
  }

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
      setForm((prev) => ({ ...prev, image: String(reader.result || '') }))
    }
    reader.readAsDataURL(file)
  }

  const handleSaveProduct = async (e) => {
    e.preventDefault()

    if (Number(form.price) < 0 || Number(form.stock) < 0) {
      toast.error('Price and stock must be 0 or greater')
      return
    }

    setSaving(true)
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
      }
      const response = await productsAPI.update(productId, payload)
      setProduct(response.data)
      setForm(toFormState(response.data))
      setQty((current) => Math.min(Math.max(1, current), Math.max(1, Number(response.data.stock || 1))))
      setEditOpen(false)
      toast.success('Product updated successfully')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update product')
    } finally {
      setSaving(false)
    }
  }

  const handleAddCart = async () => {
    if (!user) {
      toast.info('Please log in before adding to cart')
      return false
    }
    if (!isCustomer) {
      toast.info('Only customer accounts can add products to the cart')
      return false
    }

    setAdding(true)
    try {
      await addItem(productId, qty)
      toast.success(`Added ${product.name} x${qty} to cart`)
      return true
    } catch {
      toast.error('Something went wrong')
      return false
    } finally {
      setAdding(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size={36} />
      </div>
    )
  }

  if (!product) return null

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 font-body text-brown-500 text-sm transition-colors hover:text-brown-800"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <div className="mb-3 aspect-square overflow-hidden rounded-2xl bg-cream-200 shadow-card">
            {imageSrc ? (
              <img src={imageSrc} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-8xl text-brown-300">P</div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div>
            {product.category && (
              <p className="mb-1 font-display font-bold uppercase tracking-wider text-brown-400 text-xs">
                {product.category}
              </p>
            )}
            <h1 className="mb-3 font-display font-black text-3xl text-brown-900 leading-tight">
              {product.name}
            </h1>
            <p className="font-display font-black text-3xl text-brown-900">
              THB {Number(product.price || 0).toLocaleString('th-TH')}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className={`inline-flex rounded-full px-3 py-1 font-display font-bold text-xs ${stockClasses}`}>
                {stockLabel}
              </span>
              {canEditProduct && (
                <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 font-display font-bold text-blue-700 text-xs">
                  Admin tools enabled
                </span>
              )}
            </div>
          </div>

          {product.description && (
            <p className="font-body text-brown-500 text-sm leading-relaxed">{product.description}</p>
          )}

          {canEditProduct && (
            <div className="rounded-2xl bg-white p-4 shadow-card">
              <p className="mb-3 font-display font-bold text-brown-800 text-sm">Manage This Product</p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="font-body text-brown-500 text-xs">
                  Update the name, price, stock, category, image, or description from this page.
                </div>
                <Button variant="secondary" onClick={openEditModal} className="w-full sm:w-fit">
                  <Pencil size={15} />
                  Edit Product
                </Button>
              </div>
            </div>
          )}

          {isCustomer && stockValue > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex items-center overflow-hidden rounded-xl border-2 border-cream-400">
                <button
                  onClick={() => setQty((current) => Math.max(1, current - 1))}
                  className="flex h-10 w-10 items-center justify-center font-bold text-brown-500 transition-colors hover:bg-cream-200 hover:text-brown-900"
                >
                  <Minus size={14} />
                </button>
                <span className="w-12 text-center font-display font-extrabold text-brown-900 text-sm">{qty}</span>
                <button
                  onClick={() => setQty((current) => Math.min(stockValue, current + 1))}
                  className="flex h-10 w-10 items-center justify-center font-bold text-brown-500 transition-colors hover:bg-cream-200 hover:text-brown-900"
                >
                  <Plus size={14} />
                </button>
              </div>
              <span className="font-body text-brown-400 text-xs">Available: {stockValue} pcs</span>
            </div>
          )}

          {isCustomer && (
            <div className="flex flex-col gap-2">
              <Button
                variant="primary"
                size="lg"
                onClick={handleAddCart}
                loading={adding}
                disabled={stockValue === 0}
                className="w-full rounded-xl"
              >
                {stockValue === 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>
              {stockValue > 0 && (
                <Button
                  variant="primary"
                  size="lg"
                  disabled={adding}
                  onClick={async () => {
                    const added = await handleAddCart()
                    if (added) navigate('/cart')
                  }}
                  className="w-full rounded-xl"
                >
                  Buy Now
                </Button>
              )}
            </div>
          )}

          {!isCustomer && !canEditProduct && (
            <div className="rounded-2xl border border-cream-300 bg-white p-4 font-body text-brown-500 text-sm">
              This page is in view-only mode for your account. Customers can purchase this product, and admins or managers can edit it.
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {[
              { icon: Shield, label: '1 year warranty' },
              { icon: Truck, label: 'Free delivery' },
              { icon: RefreshCw, label: '7 day returns' },
            ].map((feature) => (
              <div
                key={feature.label}
                className="flex items-center gap-1.5 rounded-xl bg-blue-100 px-3 py-2 font-display font-bold text-blue-700 text-xs"
              >
                <feature.icon size={12} />
                {feature.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal open={editOpen} onClose={closeEditModal} title="Edit Product" size="md">
        <form onSubmit={handleSaveProduct} className="flex flex-col gap-4">
          <Input
            label="Product Name"
            required
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price"
              type="number"
              required
              min="0"
              value={form.price}
              onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
            />
            <Input
              label="Stock"
              type="number"
              required
              min="0"
              value={form.stock}
              onChange={(e) => setForm((prev) => ({ ...prev, stock: e.target.value }))}
            />
          </div>
          <Input
            label="Category"
            value={form.category}
            onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
          />
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
              rows={4}
              className="w-full resize-none rounded-xl border-2 border-cream-400 bg-white px-4 py-3 font-body text-brown-900 text-sm focus:border-brown-700 focus:outline-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={closeEditModal} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving} className="flex-1">
              Save
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
