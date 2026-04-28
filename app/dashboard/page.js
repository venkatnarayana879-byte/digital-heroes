'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Dashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(true)
  const [scoreForm, setScoreForm] = useState({ score: '', score_date: '' })
  const [scoreError, setScoreError] = useState('')
  const [scoreSuccess, setScoreSuccess] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*, charities(name)')
      .eq('id', user.id)
      .single()
    setProfile(profileData)

    const { data: scoresData } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', user.id)
      .order('score_date', { ascending: false })
      .limit(5)
    setScores(scoresData || [])
    setLoading(false)
  }

  const handleAddScore = async (e) => {
    e.preventDefault()
    setScoreError('')
    setScoreSuccess('')

    const scoreVal = parseInt(scoreForm.score)
    if (scoreVal < 1 || scoreVal > 45) {
      setScoreError('Score must be between 1 and 45')
      return
    }

    const { data: existing } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', profile.id)
      .order('score_date', { ascending: true })

    if (existing && existing.length >= 5) {
      await supabase.from('scores').delete().eq('id', existing[0].id)
    }

    const { error } = await supabase.from('scores').upsert({
      user_id: profile.id,
      score: scoreVal,
      score_date: scoreForm.score_date
    })

    if (error) {
      setScoreError(error.message.includes('unique') ? 'Score already exists for this date!' : error.message)
    } else {
      setScoreSuccess('Score added successfully!')
      setScoreForm({ score: '', score_date: '' })
      loadData()
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <div className="text-white font-bold text-xl">⛳ Digital Heroes</div>
        <div className="flex items-center gap-4">
          <span className="text-slate-300 text-sm hidden md:block">{profile?.email}</span>
          <button onClick={handleLogout} className="text-slate-400 hover:text-white transition text-sm">Logout</button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10 grid md:grid-cols-2 gap-6">

        {/* Subscription Status */}
        <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
          <h2 className="text-white font-bold text-lg mb-4">📋 Subscription</h2>
          <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-3 ${profile?.subscription_status === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
            {profile?.subscription_status || 'inactive'}
          </div>
          <p className="text-slate-300 text-sm">Plan: {profile?.subscription_plan || 'No active plan'}</p>
          {profile?.subscription_end_date && (
            <p className="text-slate-400 text-xs mt-1">Expires: {new Date(profile.subscription_end_date).toLocaleDateString('en-IN')}</p>
          )}
          {profile?.subscription_status !== 'active' && (
            <Link href="/subscription" className="mt-4 inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-xl text-sm transition">
              Subscribe Now →
            </Link>
          )}
        </div>

        {/* Charity */}
        <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
          <h2 className="text-white font-bold text-lg mb-4">❤️ Your Charity</h2>
          <p className="text-white font-medium">{profile?.charities?.name || 'No charity selected'}</p>
          <p className="text-slate-300 text-sm mt-2">Contribution: {profile?.charity_contribution_percent || 10}% of subscription</p>
          {profile?.subscription_status === 'active' && (
            <div className="mt-3 bg-green-500/10 rounded-xl px-4 py-2">
              <p className="text-green-300 text-sm">✅ Contributing actively</p>
            </div>
          )}
        </div>

        {/* Score Entry */}
        <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
          <h2 className="text-white font-bold text-lg mb-4">🏌️ Add Score</h2>
          <form onSubmit={handleAddScore} className="space-y-3">
            <input
              type="number" placeholder="Stableford Score (1-45)" min="1" max="45" required
              className="w-full bg-white/10 text-white placeholder-slate-400 px-4 py-3 rounded-xl border border-white/20 focus:outline-none focus:border-purple-400"
              value={scoreForm.score} onChange={e => setScoreForm({...scoreForm, score: e.target.value})}
            />
            <input
              type="date" required
              className="w-full bg-white/10 text-white px-4 py-3 rounded-xl border border-white/20 focus:outline-none focus:border-purple-400"
              value={scoreForm.score_date} onChange={e => setScoreForm({...scoreForm, score_date: e.target.value})}
            />
            {scoreError && <p className="text-red-400 text-sm">{scoreError}</p>}
            {scoreSuccess && <p className="text-green-400 text-sm">{scoreSuccess}</p>}
            <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-semibold transition">
              Add Score
            </button>
          </form>
        </div>

        {/* Scores List */}
        <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
          <h2 className="text-white font-bold text-lg mb-4">📊 My Scores (Last 5)</h2>
          {scores.length === 0 ? (
            <p className="text-slate-400">No scores yet. Add your first score!</p>
          ) : (
            <div className="space-y-2">
              {scores.map((s, i) => (
                <div key={s.id} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3">
                  <span className="text-slate-300 text-sm">{new Date(s.score_date).toLocaleDateString('en-IN')}</span>
                  <div className="flex items-center gap-2">
                    {i === 0 && <span className="text-xs text-purple-400">Latest</span>}
                    <span className={`font-bold text-lg ${i === 0 ? 'text-purple-400' : 'text-white'}`}>{s.score}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Draw Section */}
        <div className="bg-white/10 backdrop-blur rounded-2xl p-6 md:col-span-2">
          <h2 className="text-white font-bold text-lg mb-4">🏆 Monthly Prize Draw</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-yellow-500/10 rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">🥇</div>
              <p className="text-yellow-300 font-bold">Jackpot (5 match)</p>
              <p className="text-slate-300 text-sm mt-1">40% of prize pool</p>
            </div>
            <div className="bg-slate-500/10 rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">🥈</div>
              <p className="text-slate-300 font-bold">4 Match</p>
              <p className="text-slate-300 text-sm mt-1">35% of prize pool</p>
            </div>
            <div className="bg-orange-500/10 rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">🥉</div>
              <p className="text-orange-300 font-bold">3 Match</p>
              <p className="text-slate-300 text-sm mt-1">25% of prize pool</p>
            </div>
          </div>
          <p className="text-slate-400 text-sm mt-4 text-center">
            {profile?.subscription_status === 'active' 
              ? '✅ You are eligible for this month\'s draw!' 
              : '⚠️ Subscribe to enter monthly draws'}
          </p>
        </div>

      </div>
    </div>
  )
}