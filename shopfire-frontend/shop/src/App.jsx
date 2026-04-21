// src/App.jsx
import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ToastContainer } from './components/UI'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

import HomePage        from './pages/HomePage'
import ProductsPage    from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import { LoginPage, RegisterPage } from './pages/AuthPage'
import CartPage        from './pages/CartPage'
import OrdersPage      from './pages/OrdersPage'
import StaffPage       from './pages/StaffPage'
import AdminPage       from './pages/AdminPage'
import ManagerPage     from './pages/ManagerPage'

function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <p className="text-8xl font-display font-black text-stone-800 mb-4">404</p>
      <h1 className="font-display font-bold text-2xl text-stone-300 mb-2">ไม่พบหน้านี้</h1>
      <p className="font-body text-stone-500 text-sm mb-6">หน้าที่คุณค้นหาอาจถูกย้ายหรือไม่มีอยู่</p>
      <a href="/" className="px-6 py-3 bg-orange-700 hover:bg-orange-600 text-white font-body font-semibold rounded-xl transition-colors text-sm">กลับหน้าแรก</a>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen bg-stone-950 text-stone-100">
            <Navbar />
            <main>
              <Routes>
                {/* Public */}
                <Route path="/"            element={<HomePage />} />
                <Route path="/products"    element={<ProductsPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/login"       element={<LoginPage />} />
                <Route path="/register"    element={<RegisterPage />} />

                {/* Customer */}
                <Route path="/cart"   element={<ProtectedRoute roles={['customer']}><CartPage /></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute roles={['customer']}><OrdersPage /></ProtectedRoute>} />

                {/* Staff */}
                <Route path="/staff"   element={<ProtectedRoute roles={['staff', 'admin']}><StaffPage /></ProtectedRoute>} />

                {/* Admin */}
                <Route path="/admin"   element={<ProtectedRoute roles={['admin']}><AdminPage /></ProtectedRoute>} />

                {/* Manager */}
                <Route path="/manager" element={<ProtectedRoute roles={['manager', 'admin']}><ManagerPage /></ProtectedRoute>} />

                {/* Fallback */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>

            {/* Footer */}
            <footer className="mt-20 border-t border-stone-800/50 py-8 px-4">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="font-display font-bold text-stone-600 text-lg">Shop<span className="text-orange-800">Fire</span></p>
                <p className="font-body text-stone-600 text-xs">© 2025 ShopFire. All rights reserved.</p>
              </div>
            </footer>
          </div>
          <ToastContainer />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
