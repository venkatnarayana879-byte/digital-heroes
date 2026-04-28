'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Signup() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    full_name: '', email: '', password: '', charity_id: ''
  })
  const [charities, setCharities] = useState([])
  const [step, setStep] = useState(1)

  useEffect(() => {
    supabase.from('charities').select('*').eq('is_active', true).then(({ data }) => {
      setCharities(data || [])
    })
  }, [])

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { full_name: form.full_name } }
      })
      if (error) throw error
      if (form.charity_id && data.user) {
        await supabase.from('profiles').update({ 
          charity_id: form.charity_id 
        }).eq('id', data.user.id)
      }
      router.push('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <div className="bg-white/10 backdrop-blur rounded-3xl p-8 w-full max-w-md">
        
        {/* Steps indicator */}
        <div className="flex items-center gap-2 mb-6">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 1 ? 'bg-purple-600 text-white' : 'bg-purple-300 text-purple-900'}`}>1</div>
          <div className="flex-1 h-1 bg-white/20 rounded">
            <div className={`h-full bg-purple-600 rounded transition-all ${step === 2 ? 'w-full' : 'w-0'}`} />
          </div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 2 ? 'bg-purple-600 text-white' : 'bg-white/20 text-slate-400'}`}>2</div>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">
          {step === 1 ? 'Join Digital Heroes' : 'Choose Your Charity'}
        </h1>
        <p className="text-slate-300 mb-8">
          {step === 1 ? 'Play golf. Support charity. Win prizes.' : '10% of your subscription goes to your chosen charity.'}
        </p>

        {error && (
          <div className="bg-red-500/20 text-red-300 px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={(e) => { e.preventDefault(); setStep(2) }} className="space-y-4">
            <input
              type="text" placeholder="Full Name" required
              className="w-full bg-white/10 text-white placeholder-slate-400 px-4 py-3 rounded-xl border border-white/20 focus:outline-none focus:border-purple-400"
              value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})}
            />
            <input
              type="email" placeholder="Email Address" required
              className="w-full bg-white/10 text-white placeholder-slate-400 px-4 py-3 rounded-xl border border-white/20 focus:outline-none focus:border-purple-400"
              value={form.email} onChange={e => setForm({...form, email: e.target.value})}
            />
            <input
              type="password" placeholder="Password (min 6 chars)" required minLength={6}
              className="w-full bg-white/10 text-white placeholder-slate-400 px-4 py-3 rounded-xl border border-white/20 focus:outline-none focus:border-purple-400"
              value={form.password} onChange={e => setForm({...form, password: e.target.value})}
            />
            <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-semibold transition">
              Next — Choose Charity →
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-3">
              {charities.map(c => (
                <label key={c.id} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition ${form.charity_id === c.id ? 'border-purple-400 bg-purple-500/20' : 'border-white/20 bg-white/5'}`}>
                  <input type="radio" name="charity" value={c.id} 
                    onChange={e => setForm({...form, charity_id: e.target.value})} className="hidden" />
                  <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${form.charity_id === c.id ? 'border-purple-400 bg-purple-400' : 'border-white/40'}`} />
                  <span className="text-white">{c.name}</span>
                </label>
              ))}
            </div>
            <button type="submit" disabled={loading || !form.charity_id}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition">
              {loading ? 'Creating Account...' : 'Create Account →'}
            </button>
            <button type="button" 
              onClick={() => { setStep(1); setError('') }} 
              className="w-full text-slate-400 hover:text-white transition py-2">
              ← Back to Details
            </button>
          </form>
        )}

        <p className="text-slate-400 text-center mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-purple-400 hover:text-purple-300">Login</Link>
        </p>
      </div>
    </div>
  )
}