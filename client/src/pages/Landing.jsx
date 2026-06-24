import { Link } from 'react-router-dom'

const Landing = () => {
  const features = [
    { title: 'Real-time Tracking', desc: 'Monitor your AI model quotas in real-time', icon: '📊' },
    { title: 'Multi-Model Support', desc: 'Gemini, Claude, GPT-OSS - all in one place', icon: '🤖' },
    { title: 'Multi-Account', desc: 'Manage multiple Google accounts simultaneously', icon: '👥' },
    { title: 'Auto-Refresh', desc: 'Quotas updated automatically every 5 minutes', icon: '🔄' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-md border-b border-border z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">NQ</span>
            </div>
            <span className="text-xl font-bold text-text">NexusQuota</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-gray-400 hover:text-text transition-colors">Login</Link>
            <Link to="/register" className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors">Get Started</Link>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 mb-6">
            <span className="text-primary">🚀</span>
            <span className="text-primary text-sm font-medium">New</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-text mb-6">
            Your AI Quota <span className="text-primary">Command Center</span>
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Track, manage, and optimize your AI model quotas across multiple accounts and platforms
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/register" className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-lg font-semibold transition-colors">Get Started Free</Link>
            <Link to="/login" className="border border-border hover:border-gray-600 text-text px-8 py-4 rounded-lg font-semibold transition-colors">Login</Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-card">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-text">Why NexusQuota?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="bg-background border border-border rounded-xl p-6 hover:border-primary/30 transition-all">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2 text-text">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-8 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">© 2026 NexusQuota. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing
