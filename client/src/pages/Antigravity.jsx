import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import axios from 'axios'
import toast from 'react-hot-toast'

const Antigravity = ({ user, onLogout }) => {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState({})
  const [editingName, setEditingName] = useState(null)
  const [newName, setNewName] = useState('')

  const fetchAccounts = async () => {
    try {
      const res = await axios.get('/quota')
      setAccounts(res.data)
    } catch (err) {
      toast.error('Failed to fetch accounts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAccounts()
    const interval = setInterval(fetchAccounts, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const handleConnectGoogle = async () => {
    try {
      const res = await axios.get('/accounts/google-url')
      window.location.href = res.data.url
    } catch (err) {
      toast.error('Failed to get Google auth URL')
    }
  }

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    if (code) {
      axios.post('/accounts/google-callback', { code })
        .then(() => {
          toast.success('Account connected successfully')
          window.history.replaceState({}, '', window.location.pathname)
          fetchAccounts()
        })
        .catch(() => toast.error('Failed to connect account'))
    }
  }, [])

  const handleRefresh = async (id) => {
    setRefreshing(prev => ({ ...prev, [id]: true }))
    try {
      const res = await axios.post(`/quota/refresh/${id}`)
      setAccounts(prev => prev.map(a => a._id === id ? res.data : a))
      toast.success('Quota refreshed')
    } catch (err) {
      toast.error('Failed to refresh quota')
    } finally {
      setRefreshing(prev => ({ ...prev, [id]: false }))
    }
  }

  const handleToggle = async (id, enabled) => {
    try {
      const res = await axios.put(`/accounts/${id}`, { enabled: !enabled })
      setAccounts(prev => prev.map(a => a._id === id ? res.data : a))
      toast.success('Account updated')
    } catch (err) {
      toast.error('Failed to update account')
    }
  }

  const handleRename = async (id) => {
    try {
      const res = await axios.put(`/accounts/${id}`, { name: newName })
      setAccounts(prev => prev.map(a => a._id === id ? res.data : a))
      setEditingName(null)
      toast.success('Account renamed')
    } catch (err) {
      toast.error('Failed to rename account')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this account?')) return
    try {
      await axios.delete(`/accounts/${id}`)
      setAccounts(prev => prev.filter(a => a._id !== id))
      toast.success('Account removed')
    } catch (err) {
      toast.error('Failed to remove account')
    }
  }

  const mockQuotaData = [
    { model: 'Gemini 3.5 Flash (High)', used: 0, total: 1000, resetIn: '6d 23h 55m' },
    { model: 'Gemini 3.5 Flash (Low)', used: 0, total: 1000, resetIn: '6d 23h 55m' },
    { model: 'Gemini 3.1 Pro (High)', used: 0, total: 1000, resetIn: '6d 23h 55m' },
    { model: 'Gemini 3.1 Pro (Low)', used: 0, total: 1000, resetIn: '6d 23h 55m' },
    { model: 'Claude Sonnet 4.6', used: 1000, total: 1000, resetIn: '3d 23h 28m' },
    { model: 'Claude Opus 4.6', used: 1000, total: 1000, resetIn: '3d 23h 28m' },
    { model: 'GPT-OSS 120B', used: 1000, total: 1000, resetIn: '3d 23h 28m' }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Sidebar onLogout={onLogout} />
      <div className="ml-64 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text mb-2">Antigravity</h1>
            <p className="text-gray-400">Manage your Google accounts and quotas</p>
          </div>
          <button
            onClick={handleConnectGoogle}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            <span>🔗</span> Connect Google Account
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : accounts.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">🔌</div>
            <h2 className="text-xl font-semibold text-text mb-2">No accounts connected</h2>
            <p className="text-gray-400 mb-6">Connect a Google account to get started</p>
            <button
              onClick={handleConnectGoogle}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Connect Google Account
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {accounts.map((account) => {
              const quotaData = account.quotaData && account.quotaData.length > 0 ? account.quotaData : mockQuotaData
              return (
                <div key={account._id} className="bg-card border border-border rounded-xl overflow-hidden">
                  <div className="p-4 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">⚡</span>
                      {editingName === account._id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="bg-background border border-border rounded px-3 py-1 text-text"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleRename(account._id)
                              if (e.key === 'Escape') setEditingName(null)
                            }}
                          />
                          <button onClick={() => handleRename(account._id)} className="text-success hover:opacity-80">✓</button>
                          <button onClick={() => setEditingName(null)} className="text-danger hover:opacity-80">✕</button>
                        </div>
                      ) : (
                        <div>
                          <div className="font-semibold text-text">{account.name || account.email}</div>
                          <div className="text-sm text-gray-400">{account.email}</div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-400">{quotaData.length} quotas</span>
                      <button
                        onClick={() => handleRefresh(account._id)}
                        disabled={refreshing[account._id]}
                        className="p-2 hover:bg-border rounded-lg transition-colors disabled:opacity-50"
                        title="Refresh"
                      >
                        <span className={refreshing[account._id] ? 'animate-spin' : ''}>🔄</span>
                      </button>
                      <button
                        onClick={() => { setEditingName(account._id); setNewName(account.name || account.email) }}
                        className="p-2 hover:bg-border rounded-lg transition-colors"
                        title="Rename"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(account._id)}
                        className="p-2 hover:bg-border rounded-lg transition-colors"
                        title="Delete"
                      >
                        🗑️
                      </button>
                      <button
                        onClick={() => handleToggle(account._id, account.enabled)}
                        className={`p-2 rounded-lg transition-colors ${account.enabled ? 'text-success' : 'text-gray-500'}`}
                        title={account.enabled ? 'Enabled' : 'Disabled'}
                      >
                        {account.enabled ? '●' : '○'}
                      </button>
                    </div>
                  </div>

                  <div className="divide-y divide-border">
                    {quotaData.map((quota, i) => {
                      const available = quota.used < quota.total
                      const percentage = Math.round((quota.used / quota.total) * 100)
                      return (
                        <div key={i} className="p-4 flex items-center gap-4">
                          <span className={`text-lg ${available ? 'text-success' : 'text-danger'}`}>
                            {available ? '●' : '●'}
                          </span>
                          <div className="flex-1">
                            <div className="text-text">{quota.model}</div>
                            <div className="mt-2 bg-border rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full transition-all ${available ? 'bg-success' : 'bg-danger'}`}
                                style={{ width: `${100 - percentage}%` }}
                              />
                            </div>
                          </div>
                          <div className="text-right min-w-[120px]">
                            <div className="text-text">{quota.used.toLocaleString()} / {quota.total.toLocaleString()}</div>
                            <div className={`text-sm ${available ? 'text-success' : 'text-danger'}`}>
                              {100 - percentage}%
                            </div>
                          </div>
                          <div className="text-gray-400 text-sm min-w-[120px]">
                            in {quota.resetIn || '6d 23h 55m'}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Antigravity
