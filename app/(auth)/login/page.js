'use client'
import { useState } from 'react'
import { supabase } from '../../../lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Login() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ email: '', password: '' })

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      })
      if (error) throw error
      
      // Check if admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()
      
      if (profile?.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <div className="bg-white/10 backdrop-blur rounded-3xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
        <p className="text-slate-300 mb-8">Login to your Digital Heroes account</p>

        {error && <div className="bg-red-500/20 text-red-300 px-4 py-3 rounded-xl mb-4">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email" placeholder="Email Address" required
            className="w-full bg-white/10 text-white placeholder-slate-400 px-4 py-3 rounded-xl border border-white/20 focus:outline-none focus:border-purple-400"
            value={form.email} onChange={e => setForm({...form, email: e.target.value})}
          />
          <input
            type="password" placeholder="Password" required
            className="w-full bg-white/10 text-white placeholder-slate-400 px-4 py-3 rounded-xl border border-white/20 focus:outline-none focus:border-purple-400"
            value={form.password} onChange={e => setForm({...form, password: e.target.value})}
          />
          <button type="submit" disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition">
            {loading ? 'Logging in...' : 'Login →'}
          </button>
        </form>

        <p className="text-slate-400 text-center mt-6">
          Don't have an account? <Link href="/signup" className="text-purple-400 hover:text-purple-300">Sign Up</Link>
        </p>
      </div>
    </div>
  )
}