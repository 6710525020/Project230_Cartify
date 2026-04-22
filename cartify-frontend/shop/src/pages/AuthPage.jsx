import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button, Input, toast } from '../components/UI'

export function LoginPage() {
  const { login }  = useAuth()
  const navigate   = useNavigate()
  const location   = useLocation()
  const from = location.state?.from?.pathname || '/'
  const [form, setForm]     = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [error, setError]   = useState('')

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
    <div className="flex justify-center items-center bg-blue-100 px-4 min-h-screen">
      <div className="bg-white shadow-card-hover p-8 rounded-3xl w-full max-w-sm">
        <h1 className="mb-6 font-display font-black text-brown-900 text-2xl">Login</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && <div className="bg-red-50 p-3 border border-red-200 rounded-xl font-body text-red-600 text-sm">{error}</div>}

          <input
            type="email" required placeholder="Username"
            value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            className="bg-white px-4 py-3 border-2 border-cream-400 focus:border-brown-700 rounded-xl focus:outline-none w-full font-body text-brown-900 text-sm placeholder-brown-300"
          />

          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'} required placeholder="Password"
              value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              className="bg-white px-4 py-3 pr-10 border-2 border-cream-400 focus:border-brown-700 rounded-xl focus:outline-none w-full font-body text-brown-900 text-sm placeholder-brown-300"
            />
            <button type="button" onClick={() => setShowPw(!showPw)} className="top-1/2 right-3 absolute text-brown-400 hover:text-brown-700 -translate-y-1/2">
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <Button type="submit" variant="primary" size="lg" loading={loading} className="mt-1 rounded-xl w-full">
            Login
          </Button>

          <p className="font-body text-brown-500 text-sm text-center">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-purple-600 hover:underline">Register</Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export function RegisterPage() {
  const { register } = useAuth()
  const navigate     = useNavigate()
  const [form, setForm]     = useState({ name: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.name.trim())       e.name = 'กรุณากรอกชื่อ'
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

  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  return (
    <div className="flex justify-center items-center bg-cream-200 px-4 min-h-screen">
      <div className="bg-white shadow-card-hover p-8 rounded-3xl w-full max-w-sm">
        <h1 className="mb-6 font-display font-black text-brown-900 text-2xl">Register</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {errors.global && <div className="bg-red-50 p-3 border border-red-200 rounded-xl font-body text-red-600 text-sm">{errors.global}</div>}

          {[
            { key: 'name',    ph: 'Username', type: 'text' },
            { key: 'email',   ph: 'Email',    type: 'email' },
          ].map(({ key, ph, type }) => (
            <input key={key} type={type} required placeholder={ph}
              value={form[key]} onChange={f(key)}
              className={`w-full px-4 py-3 bg-white border-2 rounded-xl text-brown-900 placeholder-brown-300 font-body text-sm focus:outline-none focus:border-brown-700 ${errors[key] ? 'border-red-400' : 'border-cream-400'}`}
            />
          ))}

          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'} required placeholder="Password"
              value={form.password} onChange={f('password')}
              className={`w-full px-4 py-3 pr-10 bg-white border-2 rounded-xl text-brown-900 placeholder-brown-300 font-body text-sm focus:outline-none focus:border-brown-700 ${errors.password ? 'border-red-400' : 'border-cream-400'}`}
            />
            <button type="button" onClick={() => setShowPw(!showPw)} className="top-1/2 right-3 absolute text-brown-400 -translate-y-1/2">
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="-mt-2 text-red-500 text-xs">{errors.password}</p>}

          <input type="password" required placeholder="Confirm Password"
            value={form.confirm} onChange={f('confirm')}
            className={`w-full px-4 py-3 bg-white border-2 rounded-xl text-brown-900 placeholder-brown-300 font-body text-sm focus:outline-none focus:border-brown-700 ${errors.confirm ? 'border-red-400' : 'border-cream-400'}`}
          />
          {errors.confirm && <p className="-mt-2 text-red-500 text-xs">{errors.confirm}</p>}

          <Button type="submit" variant="primary" size="lg" loading={loading} className="mt-1 rounded-xl w-full">
            Create Account
          </Button>

          <p className="font-body text-brown-500 text-sm text-center">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-purple-600 hover:underline">Login</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
