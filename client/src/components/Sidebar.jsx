import { Link, useLocation } from 'react-router-dom'

const Sidebar = ({ onLogout, user }) => {
  const location = useLocation()

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/antigravity', label: 'Antigravity', icon: '⚡' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ]

  if (user?.role === 'superadmin') {
    navItems.push({ path: '/admin', label: 'Admin Panel', icon: '🔐' })
  }

  return (
    <div className="w-64 bg-card border-r border-border h-screen fixed left-0 top-0 p-6">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">NQ</span>
          </div>
          <span className="text-xl font-bold text-text">NexusQuota</span>
        </div>
        <p className="text-sm text-gray-400">Your AI Quota Command Center</p>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              location.pathname === item.path
                ? 'bg-primary/20 text-primary border border-primary/30'
                : 'text-gray-400 hover:bg-border hover:text-text'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <button
        onClick={onLogout}
        className="absolute bottom-6 left-6 right-6 flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-border hover:text-text transition-all"
      >
        <span>🚪</span>
        <span>Logout</span>
      </button>
    </div>
  )
}

export default Sidebar
