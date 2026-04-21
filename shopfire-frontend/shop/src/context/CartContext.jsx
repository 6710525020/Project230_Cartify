// src/context/CartContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react'
import { cartAPI } from '../services/api'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [items, setItems]   = useState([])
  const [loading, setLoading] = useState(false)

  const fetchCart = async () => {
    if (!user || user.role !== 'customer') return
    setLoading(true)
    try {
      const r = await cartAPI.get()
      setItems(r.data.items || [])
    } catch { setItems([]) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchCart() }, [user])

  const addItem = async (productId, qty = 1) => {
    await cartAPI.add(productId, qty)
    await fetchCart()
  }
  const updateItem = async (itemId, qty) => {
    await cartAPI.update(itemId, qty)
    await fetchCart()
  }
  const removeItem = async (itemId) => {
    await cartAPI.remove(itemId)
    await fetchCart()
  }
  const clearCart = async () => {
    await cartAPI.clear()
    setItems([])
  }

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const count = items.reduce((s, i) => s + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, total, count, loading, addItem, updateItem, removeItem, clearCart, refetch: fetchCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
