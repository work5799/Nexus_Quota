import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import axios from 'axios'
import toast from 'react-hot-toast'

const Admin = ({ user, onLogout }) => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('/auth/admin/users')
        setUsers(res.data.users)
      } catch (err) {
        console.error(err)
        toast.error('Failed to fetch users')
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  const handleApprove = async (userId) => {
    try {
      await axios.put(`/auth/admin/users/${userId}/approve`)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isApproved: true } : u))
      toast.success('User approved successfully!')
    } catch (err) {
      console.error(err)
      toast.error('Failed to approve user')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar onLogout={onLogout} user={user} />
      <div className="ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text mb-2">Admin Panel</h1>
          <p className="text-gray-400">Manage user accounts</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-gray-400 font-semibold">Name</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-semibold">Email</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-semibold">Role</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border/50">
                    <td className="py-3 px-4 text-text">{u.name}</td>
                    <td className="py-3 px-4 text-gray-400">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        u.role === 'superadmin' 
                          ? 'bg-purple-500/20 text-purple-400' 
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        u.isApproved 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {u.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {!u.isApproved && (
                        <button
                          onClick={() => handleApprove(u.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                        >
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Admin
