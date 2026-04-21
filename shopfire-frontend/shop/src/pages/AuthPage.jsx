// src/pages/AuthPage.jsx
import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Flame, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button, Input, toast } from '../components/UI'

function AuthCard({ children, title, sub }) {
  return (
    <div className="flex justify-center items-center bg-stone-950 px-4 min-h-screen">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(194,65,12,0.15),transparent)]" />
      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="flex justify-center items-center bg-gradient-to-br from-red-700 to-orange-500 shadow-fire rounded-xl w-10 h-10">
              <Flame size={22} className="text-white" />
            </div>
            <span className="font-display font-bold text-white text-2xl">Shop<span className="text-orange-500">Fire</span></span>
          </Link>
          <h1 className="font-display font-bold text-white text-2xl">{title}</h1>
          <p className="mt-1 font-body text-stone-400 text-sm">{sub}</p>
        </div>
        <div className="bg-stone-900 shadow-2xl p-8 border border-stone-800 rounded-2xl">
          {children}
        </div>
      </div>
    </div>
  )
}

export function LoginPage() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from = location.state?.from?.pathname || '/'
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw]   = useState(false)
  const [error, setError]     = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(form)
      toast.success(`ยินดีต้อนรับ ${user.name}!`)
      const redirects = { staff: '/staff', admin: '/admin', manager: '/manager' }
      navigate(redirects[user.role] || from, { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง')
    }
    finally { setLoading(false) }
  }

  return (
    <AuthCard title="เข้าสู่ระบบ" sub="ยินดีต้อนรับกลับมา">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error && <div className="bg-red-900/40 p-3 border border-red-700/50 rounded-lg font-body text-red-400 text-sm">{error}</div>}

        <Input label="อีเมล" type="email" required placeholder="your@email.com"
          value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />

        <div className="flex flex-col gap-1.5">
          <label className="font-body font-medium text-stone-300 text-sm">รหัสผ่าน</label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              required
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              className="bg-stone-900 px-4 py-2.5 pr-10 border border-stone-700 hover:border-stone-600 focus:border-orange-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50 w-full font-body text-stone-100 text-sm placeholder-stone-500"
            />
            <button type="button" onClick={() => setShowPw(!showPw)} className="top-1/2 right-3 absolute text-stone-500 hover:text-stone-300 -translate-y-1/2">
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <Button type="submit" variant="primary" size="lg" loading={loading} className="mt-2 w-full">
          เข้าสู่ระบบ
        </Button>

        <p className="font-body text-stone-500 text-sm text-center">
          ยังไม่มีบัญชี?{' '}
          <Link to="/register" className="font-semibold text-orange-400 hover:text-orange-300">สมัครสมาชิก</Link>
        </p>
      </form>
    </AuthCard>
  )
}

export function RegisterPage() {
  const { register } = useAuth()
  const navigate     = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw]   = useState(false)
  const [errors, setErrors]   = useState({})

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'กรุณากรอกชื่อ'
    if (!form.email.includes('@')) e.email = 'อีเมลไม่ถูกต้อง'
    if (form.password.length < 8) e.password = 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'
    if (form.password !== form.confirm) e.confirm = 'รหัสผ่านไม่ตรงกัน'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    try {
      await register({ name: form.name, email: form.email, password: form.password })
      toast.success('สมัครสมาชิกสำเร็จ!')
      navigate('/')
    } catch (err) {
      setErrors({ global: err.response?.data?.message || 'เกิดข้อผิดพลาด' })
    }
    finally { setLoading(false) }
  }

  const f = (k) => e => setForm(p => ({ ...p, [k]: e.target.value }))

  return (
    <AuthCard title="สมัครสมาชิก" sub="เริ่มต้นช้อปปิ้งกันเลย!">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {errors.global && <div className="bg-red-900/40 p-3 border border-red-700/50 rounded-lg font-body text-red-400 text-sm">{errors.global}</div>}

        <Input label="ชื่อ-นามสกุล" required placeholder="กรอกชื่อของคุณ"
          value={form.name} onChange={f('name')} error={errors.name} />
        <Input label="อีเมล" type="email" required placeholder="your@email.com"
          value={form.email} onChange={f('email')} error={errors.email} />

        <div className="flex flex-col gap-1.5">
          <label className="font-body font-medium text-stone-300 text-sm">รหัสผ่าน</label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              required placeholder="อย่างน้อย 8 ตัวอักษร"
              value={form.password} onChange={f('password')}
              className={`w-full px-4 py-2.5 bg-stone-900 border rounded-lg text-stone-100 placeholder-stone-500 font-body text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-600 pr-10 ${errors.password ? 'border-red-500' : 'border-stone-700'}`}
            />
            <button type="button" onClick={() => setShowPw(!showPw)} className="top-1/2 right-3 absolute text-stone-500 hover:text-stone-300 -translate-y-1/2">
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="font-body text-red-400 text-xs">{errors.password}</p>}
        </div>

        <Input label="ยืนยันรหัสผ่าน" type="password" required placeholder="กรอกรหัสผ่านอีกครั้ง"
          value={form.confirm} onChange={f('confirm')} error={errors.confirm} />

        <Button type="submit" variant="primary" size="lg" loading={loading} className="mt-2 w-full">
          สมัครสมาชิก
        </Button>

        <p className="font-body text-stone-500 text-sm text-center">
          มีบัญชีแล้ว?{' '}
          <Link to="/login" className="font-semibold text-orange-400 hover:text-orange-300">เข้าสู่ระบบ</Link>
        </p>
      </form>
    </AuthCard>
  )
}
