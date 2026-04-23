import React from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ToastContainer } from './components/UI'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import { LoginPage, RegisterPage } from './pages/AuthPage'
import CartPage from './pages/CartPage'
import OrdersPage from './pages/OrdersPage'
import StaffPage from './pages/StaffPage'
import AdminPage from './pages/AdminPage'
import ManagerPage from './pages/ManagerPage'
import CreateProductPage from './pages/CreateProductPage'

function NotFound() {
  return (
    <div className="flex flex-col justify-center items-center px-4 min-h-[60vh] text-center">
      <p className="mb-4 font-display font-black text-cream-400 text-8xl">404</p>
      <h1 className="mb-2 font-display font-black text-brown-800 text-2xl">เนเธกเนเธเธเธซเธเนเธฒเธเธตเน</h1>
      <p className="mb-6 font-body text-brown-400 text-sm">เธซเธเนเธฒเธ—เธตเนเธเธธเธ“เธเนเธเธซเธฒเธญเธฒเธเธ–เธนเธเธขเนเธฒเธขเธซเธฃเธทเธญเนเธกเนเธกเธตเธญเธขเธนเน</p>
      <a href="/" className="bg-brown-800 hover:bg-brown-700 shadow-btn px-6 py-3 rounded-xl font-display font-bold text-white text-sm transition-colors">เธเธฅเธฑเธเธซเธเนเธฒเนเธฃเธ</a>
    </div>
  )
}

function AppLayout() {
  const location = useLocation()
  const hideNavbar = location.pathname === '/login' || location.pathname === '/register'

  return (
    <div className="flex flex-col bg-cream-200 min-h-screen">
      {!hideNavbar && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/orders" element={<ProtectedRoute roles={['customer']}><OrdersPage /></ProtectedRoute>} />
          <Route path="/cart" element={<ProtectedRoute roles={['customer']}><CartPage /></ProtectedRoute>} />
          <Route path="/staff" element={<ProtectedRoute roles={['staff', 'admin']}><StaffPage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminPage /></ProtectedRoute>} />
          <Route path="/manager" element={<ProtectedRoute roles={['manager', 'admin']}><ManagerPage /></ProtectedRoute>} />
          <Route path="/create-product" element={<ProtectedRoute roles={['admin', 'manager']}><CreateProductPage /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <footer className="bg-brown-800 mt-auto px-4 py-5">
        <p className="font-body text-white/60 text-sm text-center">ยฉ 2026 Cartify</p>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppLayout />
          <ToastContainer />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
