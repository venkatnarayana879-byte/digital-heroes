'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Subscription() {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState('monthly')

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(data)
    }
    getProfile()
  }, [])

  const handleSubscribe = async () => {
    setLoading(true)
    // Simulate Stripe payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const endDate = selectedPlan === 'monthly' 
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)

    await supabase.from('profiles').update({
      subscription_status: 'active',
      subscription_plan: selectedPlan,
      subscription_end_date: endDate.toISOString(),
      stripe_customer_id: 'cus_test_' + Math.random().toString(36).substr(2, 9),
      stripe_subscription_id: 'sub_test_' + Math.random().toString(36).substr(2, 9),
    }).eq('id', profile.id)

    setSuccess(true)
    setLoading(false)
    setTimeout(() => router.push('/dashboard'), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        
        {success ? (
          <div className="bg-green-500/20 rounded-3xl p-10 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-white mb-2">Welcome to Digital Heroes!</h2>
            <p className="text-slate-300">Subscription activated! Redirecting to dashboard...</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-10">
              <h1 className="text-4xl font-bold text-white mb-3">Choose Your Plan</h1>
              <p className="text-slate-300">Play golf. Support charity. Win monthly prizes.</p>
            </div>

            {/* Plan Toggle */}
            <div className="flex gap-4 mb-8">
              {[
                { id: 'monthly', label: 'Monthly', price: '₹499', period: '/month', badge: null },
                { id: 'yearly', label: 'Yearly', price: '₹4,999', period: '/year', badge: 'Save 17%' },
              ].map(plan => (
                <div key={plan.id} onClick={() => setSelectedPlan(plan.id)}
                  className={`flex-1 rounded-2xl p-6 cursor-pointer border-2 transition ${selectedPlan === plan.id ? 'border-purple-400 bg-purple-500/20' : 'border-white/20 bg-white/5'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-semibold">{plan.label}</span>
                    {plan.badge && <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">{plan.badge}</span>}
                  </div>
                  <div className="text-3xl font-bold text-white">{plan.price}</div>
                  <div className="text-slate-400 text-sm">{plan.period}</div>
                </div>
              ))}
            </div>

            {/* Features */}
            <div className="bg-white/10 rounded-2xl p-6 mb-8">
              <h3 className="text-white font-semibold mb-4">What's included:</h3>
              <div className="space-y-3">
                {[
                  '🏌️ Unlimited score tracking (rolling 5 best scores)',
                  '❤️ 10% of subscription goes to your chosen charity',
                  '🏆 Monthly prize draw entry',
                  '🎯 Match 3, 4, or 5 numbers to win prizes',
                  '📊 Performance analytics dashboard',
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Form (Stripe UI simulation) */}
            <div className="bg-white/10 rounded-2xl p-6 mb-6">
              <h3 className="text-white font-semibold mb-4">💳 Payment Details</h3>
              <div className="space-y-3">
                <input type="text" placeholder="Card Number" defaultValue="4242 4242 4242 4242"
                  className="w-full bg-white/10 text-white placeholder-slate-400 px-4 py-3 rounded-xl border border-white/20 focus:outline-none focus:border-purple-400" />
                <div className="flex gap-3">
                  <input type="text" placeholder="MM/YY" defaultValue="12/27"
                    className="flex-1 bg-white/10 text-white placeholder-slate-400 px-4 py-3 rounded-xl border border-white/20 focus:outline-none focus:border-purple-400" />
                  <input type="text" placeholder="CVC" defaultValue="123"
                    className="flex-1 bg-white/10 text-white placeholder-slate-400 px-4 py-3 rounded-xl border border-white/20 focus:outline-none focus:border-purple-400" />
                </div>
                <input type="text" placeholder="Name on card"
                  className="w-full bg-white/10 text-white placeholder-slate-400 px-4 py-3 rounded-xl border border-white/20 focus:outline-none focus:border-purple-400" />
              </div>
              <p className="text-slate-500 text-xs mt-3">🔒 Test mode — no real payment processed</p>
            </div>

            <button onClick={handleSubscribe} disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-4 rounded-2xl font-bold text-lg transition">
              {loading ? '⏳ Processing...' : `Subscribe ${selectedPlan === 'monthly' ? '₹499/month' : '₹4,999/year'} →`}
            </button>

            <p className="text-center text-slate-500 text-sm mt-4">
              <Link href="/dashboard" className="hover:text-white transition">← Back to Dashboard</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}