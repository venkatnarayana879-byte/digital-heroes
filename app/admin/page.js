'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function AdminPanel() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('users')
  const [users, setUsers] = useState([])
  const [draws, setDraws] = useState([])
  const [winners, setWinners] = useState([])
  const [charities, setCharities] = useState([])
  const [loading, setLoading] = useState(true)
  const [drawSimulation, setDrawSimulation] = useState(null)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const [usersRes, drawsRes, winnersRes, charitiesRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('draws').select('*').order('created_at', { ascending: false }),
      supabase.from('winners').select('*, profiles(email), draws(draw_date)').order('created_at', { ascending: false }),
      supabase.from('charities').select('*').order('created_at', { ascending: false }),
    ])

    setUsers(usersRes.data || [])
    setDraws(drawsRes.data || [])
    setWinners(winnersRes.data || [])
    setCharities(charitiesRes.data || [])
    setLoading(false)
  }

  const simulateDraw = () => {
    const numbers = []
    while (numbers.length < 5) {
      const n = Math.floor(Math.random() * 45) + 1
      if (!numbers.includes(n)) numbers.push(n)
    }
    setDrawSimulation(numbers.sort((a, b) => a - b))
  }

  const publishDraw = async () => {
    if (!drawSimulation) return
    const activeUsers = users.filter(u => u.subscription_status === 'active')
    const totalPool = activeUsers.length * 10
    const { error } = await supabase.from('draws').insert({
      draw_date: new Date().toISOString().split('T')[0],
      draw_numbers: drawSimulation,
      status: 'published',
      draw_type: 'random',
      total_prize_pool: totalPool,
      jackpot_pool: totalPool * 0.40,
      four_match_pool: totalPool * 0.35,
      three_match_pool: totalPool * 0.25,
    })
    if (!error) {
      setDrawSimulation(null)
      loadData()
      alert('Draw published!')
    }
  }

  const updateSubscription = async (userId, status) => {
    await supabase.from('profiles').update({ 
      subscription_status: status,
      subscription_plan: status === 'active' ? 'monthly' : null
    }).eq('id', userId)
    loadData()
  }

  const updateWinnerPayment = async (winnerId) => {
    await supabase.from('winners').update({ payment_status: 'paid' }).eq('id', winnerId)
    loadData()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-white text-xl">Loading...</div>
    </div>
  )

  const tabs = ['users', 'draws', 'winners', 'charities']

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <div className="text-white font-bold text-xl">⛳ Digital Heroes — Admin</div>
        <button onClick={handleLogout} className="text-slate-400 hover:text-white transition text-sm">Logout</button>
      </nav>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-8 py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: users.length, icon: '👥' },
          { label: 'Active Subscribers', value: users.filter(u => u.subscription_status === 'active').length, icon: '✅' },
          { label: 'Total Draws', value: draws.length, icon: '🎯' },
          { label: 'Total Winners', value: winners.length, icon: '🏆' },
        ].map((stat, i) => (
          <div key={i} className="bg-white/10 backdrop-blur rounded-2xl p-5 text-center">
            <div className="text-3xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-slate-400 text-sm">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex gap-2 mb-6">
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-xl text-sm font-medium capitalize transition ${activeTab === tab ? 'bg-purple-600 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
            <h2 className="text-white font-bold text-lg mb-4">User Management</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400 border-b border-white/10">
                    <th className="text-left py-3">Email</th>
                    <th className="text-left py-3">Status</th>
                    <th className="text-left py-3">Plan</th>
                    <th className="text-left py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b border-white/5">
                      <td className="py-3 text-white">{u.email}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${u.subscription_status === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                          {u.subscription_status}
                        </span>
                      </td>
                      <td className="py-3 text-slate-300">{u.subscription_plan || '-'}</td>
                      <td className="py-3">
                        {u.subscription_status !== 'active' ? (
                          <button onClick={() => updateSubscription(u.id, 'active')}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-xs transition">
                            Activate
                          </button>
                        ) : (
                          <button onClick={() => updateSubscription(u.id, 'cancelled')}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-xs transition">
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Draws Tab */}
        {activeTab === 'draws' && (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
              <h2 className="text-white font-bold text-lg mb-4">Run Draw</h2>
              <button onClick={simulateDraw}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition mr-4">
                🎲 Simulate Draw
              </button>
              {drawSimulation && (
                <div className="mt-4">
                  <p className="text-slate-300 mb-3">Simulated Numbers:</p>
                  <div className="flex gap-3 mb-4">
                    {drawSimulation.map((n, i) => (
                      <div key={i} className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {n}
                      </div>
                    ))}
                  </div>
                  <button onClick={publishDraw}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition">
                    ✅ Publish Draw
                  </button>
                </div>
              )}
            </div>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
              <h2 className="text-white font-bold text-lg mb-4">Draw History</h2>
              {draws.length === 0 ? <p className="text-slate-400">No draws yet.</p> : (
                <div className="space-y-3">
                  {draws.map(d => (
                    <div key={d.id} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3">
                      <span className="text-slate-300 text-sm">{d.draw_date}</span>
                      <div className="flex gap-2">
                        {d.draw_numbers.map((n, i) => (
                          <span key={i} className="w-8 h-8 bg-purple-600/50 rounded-full flex items-center justify-center text-white text-xs font-bold">{n}</span>
                        ))}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${d.status === 'published' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                        {d.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Winners Tab */}
        {activeTab === 'winners' && (
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
            <h2 className="text-white font-bold text-lg mb-4">Winners Management</h2>
            {winners.length === 0 ? <p className="text-slate-400">No winners yet.</p> : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400 border-b border-white/10">
                    <th className="text-left py-3">User</th>
                    <th className="text-left py-3">Match</th>
                    <th className="text-left py-3">Prize</th>
                    <th className="text-left py-3">Payment</th>
                    <th className="text-left py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {winners.map(w => (
                    <tr key={w.id} className="border-b border-white/5">
                      <td className="py-3 text-white">{w.profiles?.email}</td>
                      <td className="py-3 text-slate-300">{w.match_type}</td>
                      <td className="py-3 text-green-300">₹{w.prize_amount}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${w.payment_status === 'paid' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                          {w.payment_status}
                        </span>
                      </td>
                      <td className="py-3">
                        {w.payment_status !== 'paid' && (
                          <button onClick={() => updateWinnerPayment(w.id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-xs transition">
                            Mark Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Charities Tab */}
        {activeTab === 'charities' && (
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
            <h2 className="text-white font-bold text-lg mb-4">Charity Management</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {charities.map(c => (
                <div key={c.id} className="bg-white/5 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{c.name}</p>
                    <p className="text-slate-400 text-sm">{c.description}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${c.is_featured ? 'bg-purple-500/20 text-purple-300' : 'bg-white/10 text-slate-400'}`}>
                    {c.is_featured ? 'Featured' : 'Active'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="pb-10" />
    </div>
  )
}