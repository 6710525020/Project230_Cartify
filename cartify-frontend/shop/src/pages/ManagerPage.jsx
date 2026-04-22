import React, { useEffect, useState } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { TrendingUp, Package, Users, ShoppingBag } from 'lucide-react'
import { reportsAPI } from '../services/api'
import { Spinner } from '../components/UI'

const COLORS = ['#3b1f14', '#6b3d28', '#b8906a', '#f5c842', '#d4b89a', '#8b5e3c']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white shadow-card px-4 py-3 border-2 border-cream-300 rounded-xl">
      <p className="mb-1 font-display font-bold text-brown-500 text-xs">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-display font-extrabold text-brown-800 text-sm">{p.name}: {p.value?.toLocaleString('th-TH')}</p>
      ))}
    </div>
  )
}

export default function ManagerPage() {
  const [salesData, setSalesData]       = useState(null)
  const [productsData, setProductsData] = useState(null)
  const [customersData, setCustomersData] = useState(null)
  const [loading, setLoading]           = useState(true)
  const [period, setPeriod]             = useState('month')
  const [activeTab, setActiveTab]       = useState('sales')

  useEffect(() => {
    setLoading(true)
    Promise.all([
      reportsAPI.sales({ period }).catch(() => ({ data: {} })),
      reportsAPI.products({ period }).catch(() => ({ data: {} })),
      reportsAPI.customers({ period }).catch(() => ({ data: {} })),
    ]).then(([s, p, c]) => {
      setSalesData(s.data)
      setProductsData(p.data)
      setCustomersData(c.data)
    }).finally(() => setLoading(false))
  }, [period])

  // Fallback mock
  const salesChart = salesData?.chart || [
    { name: 'ม.ค.', ยอดขาย: 48000, คำสั่งซื้อ: 32 },
    { name: 'ก.พ.', ยอดขาย: 62000, คำสั่งซื้อ: 41 },
    { name: 'มี.ค.', ยอดขาย: 55000, คำสั่งซื้อ: 37 },
    { name: 'เม.ย.', ยอดขาย: 78000, คำสั่งซื้อ: 52 },
    { name: 'พ.ค.', ยอดขาย: 91000, คำสั่งซื้อ: 64 },
    { name: 'มิ.ย.', ยอดขาย: 84000, คำสั่งซื้อ: 58 },
  ]
  const topProducts  = productsData?.topProducts || [
    { name: 'สินค้า A', sold: 145, revenue: 72500 },
    { name: 'สินค้า B', sold: 98,  revenue: 49000 },
    { name: 'สินค้า C', sold: 87,  revenue: 43500 },
    { name: 'สินค้า D', sold: 72,  revenue: 36000 },
    { name: 'สินค้า E', sold: 61,  revenue: 30500 },
  ]
  const categoryData = productsData?.categories || [
    { name: 'อิเล็กทรอนิกส์', value: 35 },
    { name: 'เสื้อผ้า', value: 25 },
    { name: 'อาหาร', value: 20 },
    { name: 'ของใช้', value: 20 },
  ]
  const customerChart = customersData?.chart || [
    { name: 'ม.ค.', ใหม่: 24, กลับมา: 58 },
    { name: 'ก.พ.', ใหม่: 31, กลับมา: 72 },
    { name: 'มี.ค.', ใหม่: 28, กลับมา: 65 },
    { name: 'เม.ย.', ใหม่: 42, กลับมา: 89 },
    { name: 'พ.ค.', ใหม่: 38, กลับมา: 94 },
    { name: 'มิ.ย.', ใหม่: 35, กลับมา: 88 },
  ]

  const stats = {
    totalRevenue:  salesData?.totalRevenue  || salesChart.reduce((s,d)=>s+(d.ยอดขาย||0),0),
    totalOrders:   salesData?.totalOrders   || salesChart.reduce((s,d)=>s+(d.คำสั่งซื้อ||0),0),
    totalCustomers:customersData?.total     || 234,
    totalProducts: productsData?.total      || 5,
  }

  const statCards = [
    { label: 'Sales',    value: stats.totalRevenue,   fmt: v=>`฿${(v/1000).toFixed(0)}K`, icon: TrendingUp, bg: 'bg-blue-100', text: 'text-blue-800' },
    { label: 'Orders',   value: stats.totalOrders,    fmt: v=>v,  icon: ShoppingBag, bg: 'bg-cream-200', text: 'text-brown-800' },
    { label: 'Products', value: stats.totalProducts,  fmt: v=>v,  icon: Package,     bg: 'bg-yellow-100',text: 'text-yellow-800' },
    { label: 'Users',    value: stats.totalCustomers, fmt: v=>v,  icon: Users,       bg: 'bg-brown-800', text: 'text-white' },
  ]

  const tabs = [
    { key: 'sales',     label: 'ยอดขาย',  icon: TrendingUp },
    { key: 'products',  label: 'สินค้า',  icon: Package },
    { key: 'customers', label: 'ลูกค้า',  icon: Users },
  ]

  return (
    <div className="mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display font-black text-brown-900 text-3xl">Business Overview</h1>
        <select value={period} onChange={e => setPeriod(e.target.value)}
          className="bg-white px-4 py-2 border-2 border-cream-400 focus:border-brown-700 rounded-xl focus:outline-none font-body text-brown-700 text-sm">
          <option value="week">7 วัน</option>
          <option value="month">30 วัน</option>
          <option value="quarter">3 เดือน</option>
          <option value="year">1 ปี</option>
        </select>
      </div>

      {/* Stat cards — exactly like screenshot */}
      <div className="gap-4 grid grid-cols-2 md:grid-cols-4 mb-8">
        {statCards.map((s, i) => (
          <div key={i} className={`${s.bg} rounded-2xl p-6 shadow-card`}>
            <p className={`font-display font-bold text-sm ${s.text} opacity-70 mb-3`}>{s.label}</p>
            <p className={`font-display font-black text-4xl ${s.text}`}>{s.fmt(s.value)}</p>
          </div>
        ))}
      </div>

      {/* Tab selector */}
      <div className="flex gap-2 mb-6">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-display font-bold transition-colors ${activeTab === t.key ? 'bg-brown-800 text-white shadow-btn' : 'bg-white text-brown-600 hover:bg-cream-300 shadow-card'}`}>
            <t.icon size={15} />{t.label}
          </button>
        ))}
      </div>

      {loading ? <Spinner size={32} /> : (
        <div className="gap-5 grid lg:grid-cols-3">
          {activeTab === 'sales' && <>
            <div className="lg:col-span-2 bg-white shadow-card p-6 rounded-2xl">
              <h2 className="mb-5 font-display font-extrabold text-brown-900 text-lg">ยอดขายรายเดือน</h2>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={salesChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ede8df" />
                  <XAxis dataKey="name" tick={{ fill: '#8b5e3c', fontSize: 12, fontFamily: 'Nunito' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#8b5e3c', fontSize: 11, fontFamily: 'Nunito' }} axisLine={false} tickLine={false} tickFormatter={v=>`฿${(v/1000).toFixed(0)}K`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="ยอดขาย" stroke="#3b1f14" strokeWidth={2.5} dot={{ fill: '#3b1f14', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white shadow-card p-6 rounded-2xl">
              <h2 className="mb-5 font-display font-extrabold text-brown-900 text-lg">จำนวนคำสั่งซื้อ</h2>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={salesChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ede8df" />
                  <XAxis dataKey="name" tick={{ fill: '#8b5e3c', fontSize: 12, fontFamily: 'Nunito' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#8b5e3c', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="คำสั่งซื้อ" fill="#f5c842" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>}

          {activeTab === 'products' && <>
            <div className="lg:col-span-2 bg-white shadow-card p-6 rounded-2xl">
              <h2 className="mb-5 font-display font-extrabold text-brown-900 text-lg">สินค้าขายดี Top 5</h2>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={topProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#ede8df" horizontal={false} />
                  <XAxis type="number" tick={{ fill:'#8b5e3c', fontSize:11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill:'#6b3d28', fontSize:12, fontFamily:'Nunito', fontWeight:'700' }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="sold" name="จำนวนขาย" fill="#3b1f14" radius={[0,6,6,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white shadow-card p-6 rounded-2xl">
              <h2 className="mb-5 font-display font-extrabold text-brown-900 text-lg">หมวดหมู่</h2>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${(percent*100).toFixed(0)}%`} labelLine={false} style={{ fontSize:'11px', fontFamily:'Nunito' }}>
                    {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3">
                {topProducts.slice(0,5).map((p,i)=>(
                  <div key={i} className="flex justify-between font-body text-brown-600 text-sm">
                    <span>{p.name}</span>
                    <span className="font-display font-extrabold text-brown-900">฿{p.revenue?.toLocaleString('th-TH')}</span>
                  </div>
                ))}
              </div>
            </div>
          </>}

          {activeTab === 'customers' && <>
            <div className="lg:col-span-2 bg-white shadow-card p-6 rounded-2xl">
              <h2 className="mb-5 font-display font-extrabold text-brown-900 text-lg">ลูกค้าใหม่ vs กลับมาซื้อ</h2>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={customerChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ede8df" />
                  <XAxis dataKey="name" tick={{ fill:'#8b5e3c', fontSize:12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill:'#8b5e3c', fontSize:11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontFamily:'Nunito', fontSize:'12px', fontWeight:'700' }} />
                  <Bar dataKey="ใหม่"    fill="#3b1f14" radius={[6,6,0,0]} />
                  <Bar dataKey="กลับมา" fill="#f5c842" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white shadow-card p-6 rounded-2xl">
              <h2 className="mb-5 font-display font-extrabold text-brown-900 text-lg">สถิติลูกค้า</h2>
              {[
                { label:'ลูกค้าทั้งหมด',         value: stats.totalCustomers },
                { label:'ลูกค้าใหม่เดือนนี้',    value: customersData?.newThisMonth || 35 },
                { label:'ลูกค้าประจำ',            value: customersData?.returning    || 89 },
                { label:'อัตรากลับมาซื้อ',        value: `${customersData?.returnRate || 72}%` },
                { label:'ยอดเฉลี่ยต่อคำสั่ง',    value: `฿${(customersData?.avgOrderValue||1580).toLocaleString('th-TH')}` },
              ].map((s,i)=>(
                <div key={i} className="flex justify-between items-center py-3 border-cream-200 last:border-0 border-b">
                  <span className="font-body text-brown-500 text-sm">{s.label}</span>
                  <span className="font-display font-extrabold text-brown-900 text-lg">{s.value}</span>
                </div>
              ))}
            </div>
          </>}
        </div>
      )}
    </div>
  )
}
