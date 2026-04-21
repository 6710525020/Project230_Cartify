// src/pages/ManagerPage.jsx — ผู้จัดการ: รายงานและวิเคราะห์
import React, { useEffect, useState } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { TrendingUp, Package, Users, ShoppingBag, Calendar, Download } from 'lucide-react'
import { reportsAPI } from '../services/api'
import { Spinner, Select, Button } from '../components/UI'

const FIRE_COLORS = ['#c2410c', '#f97316', '#fbbf24', '#ef4444', '#dc2626', '#ea580c']

function StatCard({ icon: Icon, label, value, sub, color = 'text-orange-400' }) {
  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-lg bg-stone-800 flex items-center justify-center ${color}`}>
          <Icon size={20} />
        </div>
      </div>
      <p className={`font-display font-bold text-3xl ${color} mb-1`}>{value}</p>
      <p className="font-body text-stone-400 text-sm">{label}</p>
      {sub && <p className="font-body text-xs text-stone-600 mt-1">{sub}</p>}
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 shadow-xl">
      <p className="font-body text-xs text-stone-400 mb-2">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-display font-semibold text-sm" style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' && p.name?.includes('ยอด') ? `฿${p.value.toLocaleString('th-TH')}` : p.value}
        </p>
      ))}
    </div>
  )
}

export default function ManagerPage() {
  const [salesData, setSalesData]     = useState(null)
  const [productsData, setProductsData] = useState(null)
  const [customersData, setCustomersData] = useState(null)
  const [loading, setLoading]         = useState(true)
  const [period, setPeriod]           = useState('month')
  const [activeTab, setActiveTab]     = useState('sales')

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

  // Fallback mock data if backend not ready
  const salesChart = salesData?.chart || [
    { name: 'ม.ค.', ยอดขาย: 48000, คำสั่งซื้อ: 32 },
    { name: 'ก.พ.', ยอดขาย: 62000, คำสั่งซื้อ: 41 },
    { name: 'มี.ค.', ยอดขาย: 55000, คำสั่งซื้อ: 37 },
    { name: 'เม.ย.', ยอดขาย: 78000, คำสั่งซื้อ: 52 },
    { name: 'พ.ค.', ยอดขาย: 91000, คำสั่งซื้อ: 64 },
    { name: 'มิ.ย.', ยอดขาย: 84000, คำสั่งซื้อ: 58 },
  ]

  const topProducts = productsData?.topProducts || [
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

  const summaryStats = {
    totalRevenue:  salesData?.totalRevenue  || salesChart.reduce((s, d) => s + (d.ยอดขาย || 0), 0),
    totalOrders:   salesData?.totalOrders   || salesChart.reduce((s, d) => s + (d.คำสั่งซื้อ || 0), 0),
    totalCustomers:customersData?.total     || 234,
    totalProducts: productsData?.total      || topProducts.length,
  }

  const tabs = [
    { key: 'sales',    label: 'ยอดขาย',    icon: TrendingUp },
    { key: 'products', label: 'สินค้า',    icon: Package },
    { key: 'customers',label: 'ลูกค้า',    icon: Users },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-white mb-1">รายงานและวิเคราะห์</h1>
          <p className="font-body text-stone-400 text-sm">ภาพรวมธุรกิจและสถิติการขาย</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={period} onChange={e => setPeriod(e.target.value)}
            className="px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-sm text-stone-300 font-body focus:outline-none focus:border-orange-600">
            <option value="week">7 วัน</option>
            <option value="month">30 วัน</option>
            <option value="quarter">3 เดือน</option>
            <option value="year">1 ปี</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={TrendingUp} label="ยอดขายรวม"     value={`฿${(summaryStats.totalRevenue/1000).toFixed(0)}K`} color="text-orange-400" />
        <StatCard icon={ShoppingBag} label="คำสั่งซื้อรวม" value={summaryStats.totalOrders}    color="text-red-400" />
        <StatCard icon={Users}       label="ลูกค้าทั้งหมด" value={summaryStats.totalCustomers}  color="text-amber-400" />
        <StatCard icon={Package}     label="สินค้า"         value={summaryStats.totalProducts}   color="text-emerald-400" />
      </div>

      {/* Tab selector */}
      <div className="flex items-center gap-1 mb-6 bg-stone-900 border border-stone-800 rounded-xl p-1 w-fit">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-body font-medium transition-all ${activeTab === t.key ? 'bg-orange-700 text-white shadow-fire' : 'text-stone-400 hover:text-stone-200'}`}>
            <t.icon size={15} />{t.label}
          </button>
        ))}
      </div>

      {loading ? <Spinner size={36} /> : (
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Sales Tab */}
          {activeTab === 'sales' && (
            <>
              <div className="lg:col-span-2 bg-stone-900 border border-stone-800 rounded-xl p-6">
                <h2 className="font-display font-semibold text-stone-200 text-lg mb-6">ยอดขายรายเดือน</h2>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={salesChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#292524" />
                    <XAxis dataKey="name" tick={{ fill: '#78716c', fontSize: 12, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#78716c', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} tickFormatter={v => `฿${(v/1000).toFixed(0)}K`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="ยอดขาย" stroke="#f97316" strokeWidth={2.5} dot={{ fill: '#f97316', r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-stone-900 border border-stone-800 rounded-xl p-6">
                <h2 className="font-display font-semibold text-stone-200 text-lg mb-6">จำนวนคำสั่งซื้อ</h2>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={salesChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#292524" />
                    <XAxis dataKey="name" tick={{ fill: '#78716c', fontSize: 12, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#78716c', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="คำสั่งซื้อ" fill="#c2410c" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <>
              <div className="lg:col-span-2 bg-stone-900 border border-stone-800 rounded-xl p-6">
                <h2 className="font-display font-semibold text-stone-200 text-lg mb-6">สินค้าขายดี Top 5</h2>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={topProducts} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#292524" horizontal={false} />
                    <XAxis type="number" tick={{ fill: '#78716c', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fill: '#a8a29e', fontSize: 12, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} width={80} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="sold" name="จำนวนขาย" fill="#f97316" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-stone-900 border border-stone-800 rounded-xl p-6">
                <h2 className="font-display font-semibold text-stone-200 text-lg mb-6">สัดส่วนหมวดหมู่</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}
                      style={{ fontSize: '11px', fontFamily: 'DM Sans', fill: '#a8a29e' }}>
                      {categoryData.map((_, i) => <Cell key={i} fill={FIRE_COLORS[i % FIRE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {topProducts.slice(0, 5).map((p, i) => (
                    <div key={i} className="flex justify-between items-center text-sm font-body">
                      <span className="text-stone-400">{p.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-stone-500">{p.sold} ชิ้น</span>
                        <span className="text-orange-400 font-semibold">฿{p.revenue?.toLocaleString('th-TH')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Customers Tab */}
          {activeTab === 'customers' && (
            <>
              <div className="lg:col-span-2 bg-stone-900 border border-stone-800 rounded-xl p-6">
                <h2 className="font-display font-semibold text-stone-200 text-lg mb-6">ลูกค้าใหม่ vs กลับมาซื้อซ้ำ</h2>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={customerChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#292524" />
                    <XAxis dataKey="name" tick={{ fill: '#78716c', fontSize: 12, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#78716c', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontFamily: 'DM Sans', fontSize: '12px', color: '#a8a29e' }} />
                    <Bar dataKey="ใหม่"    fill="#c2410c"  radius={[4, 4, 0, 0]} />
                    <Bar dataKey="กลับมา" fill="#f97316"  radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-stone-900 border border-stone-800 rounded-xl p-6">
                <h2 className="font-display font-semibold text-stone-200 text-lg mb-6">สถิติลูกค้า</h2>
                <div className="flex flex-col gap-4">
                  {[
                    { label: 'ลูกค้าทั้งหมด',       value: summaryStats.totalCustomers, color: 'text-stone-200' },
                    { label: 'ลูกค้าใหม่ (เดือนนี้)', value: customersData?.newThisMonth || 35, color: 'text-orange-400' },
                    { label: 'ลูกค้าประจำ',           value: customersData?.returning    || 89, color: 'text-amber-400' },
                    { label: 'อัตราการกลับมาซื้อ',    value: `${customersData?.returnRate || 72}%`, color: 'text-emerald-400' },
                    { label: 'ยอดซื้อเฉลี่ยต่อคำสั่ง', value: `฿${(customersData?.avgOrderValue || 1580).toLocaleString('th-TH')}`, color: 'text-blue-400' },
                  ].map((s, i) => (
                    <div key={i} className="flex justify-between items-center py-3 border-b border-stone-800 last:border-0">
                      <span className="font-body text-sm text-stone-400">{s.label}</span>
                      <span className={`font-display font-bold text-lg ${s.color}`}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
