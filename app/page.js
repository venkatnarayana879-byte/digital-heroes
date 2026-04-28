import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-6">
        <div className="text-white font-bold text-2xl">⛳ Digital Heroes</div>
        <div className="flex gap-4">
          <Link href="/login" className="text-white hover:text-purple-300 transition">Login</Link>
          <Link href="/signup" className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full transition">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-8 py-20">
        <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-4">Golf · Charity · Rewards</p>
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          Play Golf.<br />
          <span className="text-purple-400">Change Lives.</span><br />
          Win Big.
        </h1>
        <p className="text-slate-300 text-xl max-w-2xl mx-auto mb-10">
          Track your golf scores, support a charity you love, and enter monthly prize draws — all in one place.
        </p>
        <Link href="/signup" className="bg-purple-600 hover:bg-purple-700 text-white text-lg px-10 py-4 rounded-full font-semibold transition inline-block">
          Start Your Journey →
        </Link>
      </section>

      {/* How it works */}
      <section className="px-8 py-16 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-white text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: '🏌️', title: 'Track Your Scores', desc: 'Enter your Stableford scores after every round. We keep your best 5.' },
            { icon: '❤️', title: 'Support Charity', desc: 'Choose a charity at signup. A portion of your subscription goes directly to them.' },
            { icon: '🏆', title: 'Win Monthly Prizes', desc: 'Your scores enter you into monthly draws. Match numbers and win big!' },
          ].map((item, i) => (
            <div key={i} className="bg-white/10 backdrop-blur rounded-2xl p-8 text-center">
              <div className="text-5xl mb-4">{item.icon}</div>
              <h3 className="text-white font-bold text-xl mb-3">{item.title}</h3>
              <p className="text-slate-300">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Charities */}
      <section className="px-8 py-16 bg-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Making Real Impact</h2>
          <p className="text-slate-300 text-lg mb-10">Every subscription contributes to life-changing charities across India.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Cancer Research India', 'Child Education Fund', 'Green Earth Foundation', 'Rural Health Initiative'].map((c, i) => (
              <div key={i} className="bg-white/10 rounded-xl p-4 text-white text-sm font-medium">{c}</div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center px-8 py-20">
        <h2 className="text-4xl font-bold text-white mb-6">Ready to Make a Difference?</h2>
        <p className="text-slate-300 text-lg mb-8">Join thousands of golfers changing lives one round at a time.</p>
        <Link href="/signup" className="bg-purple-600 hover:bg-purple-700 text-white text-lg px-10 py-4 rounded-full font-semibold transition inline-block">
          Subscribe Now →
        </Link>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-slate-500 text-sm">
        © 2026 Digital Heroes Golf. All rights reserved.
      </footer>
    </main>
  )
}