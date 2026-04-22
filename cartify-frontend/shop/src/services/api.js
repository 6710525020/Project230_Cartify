import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'https://project230-cartify.onrender.com'

const api = axios.create({
  baseURL: API,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

//Auto-attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

//Global error handler
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

//Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  logout:   ()     => api.post('/auth/logout'),
  me:       ()     => api.get('/auth/me'),
}

//Products
export const productsAPI = {
  getAll:   (params) => api.get('/products', { params }),
  getOne:   (id)     => api.get(`/products/${id}`),
  search:   (q)      => api.get('/products/search', { params: { q } }),
  create:   (data)   => api.post('/products', data),
  update:   (id, d)  => api.put(`/products/${id}`, d),
  delete:   (id)     => api.delete(`/products/${id}`),
  getCategories: ()  => api.get('/products/categories'),
}

//Cart
export const cartAPI = {
  get:    ()           => api.get('/cart'),
  add:    (productId, qty) => api.post('/cart/items', { productId, quantity: qty }),
  update: (itemId, qty)    => api.put(`/cart/items/${itemId}`, { quantity: qty }),
  remove: (itemId)         => api.delete(`/cart/items/${itemId}`),
  clear:  ()               => api.delete('/cart'),
}

//Orders
export const ordersAPI = {
  create:      (data)         => api.post('/orders', data),
  getMyOrders: ()             => api.get('/orders/me'),
  getOne:      (id)           => api.get(`/orders/${id}`),
  getAll:      (params)       => api.get('/orders', { params }),
  confirm:     (id)           => api.put(`/orders/${id}/confirm`),
  updateStatus:(id, status)   => api.put(`/orders/${id}/status`, { status }),
}

//Customers (Admin)
export const customersAPI = {
  getAll:  (params) => api.get('/customers', { params }),
  getOne:  (id)     => api.get(`/customers/${id}`),
  update:  (id, d)  => api.put(`/customers/${id}`, d),
  delete:  (id)     => api.delete(`/customers/${id}`),
}

//Reports (Manager)
export const reportsAPI = {
  sales:    (params) => api.get('/reports/sales', { params }),
  products: (params) => api.get('/reports/products', { params }),
  customers:(params) => api.get('/reports/customers', { params }),
}

export default api
