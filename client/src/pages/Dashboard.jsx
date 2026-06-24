import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import axios from 'axios'

const Dashboard = ({ user, onLogout }) => {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/accounts')
        setAccounts(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const stats = {
    totalAccounts: accounts.length,
    totalQuotas: accounts.length * 7,
    exhaustedQuotas: accounts.reduce((acc, a) => acc + (a.quotaData?.filter(q => q.used >= q.total)?.length || 0), 0)
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar onLogout={onLogout} user={user} />
      <div className="ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text mb-2">Dashboard</h1>
          <p className="text-gray-400">Welcome back, {user?.name}!</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="text-4xl mb-2">👥</div>
              <div className="text-3xl font-bold text-text mb-1">{stats.totalAccounts}</div>
              <div className="text-gray-400">Connected Accounts</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="text-4xl mb-2">📊</div>
              <div className="text-3xl font-bold text-text mb-1">{stats.totalQuotas}</div>
              <div className="text-gray-400">Total Model Quotas</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="text-4xl mb-2">⚠️</div>
              <div className="text-3xl font-bold text-danger mb-1">{stats.exhaustedQuotas}</div>
              <div className="text-gray-400">Exhausted Quotas</div>
            </div>
          </div>
        )}

        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-xl font-semibold text-text mb-4">Quick Actions</h2>
          <div className="flex gap-4">
            <button
              onClick={() => window.location.href = '/antigravity'}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Go to Antigravity
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
