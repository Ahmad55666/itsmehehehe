import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useNotification } from './notifications'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(null)
  const [bypassMode, setBypassMode] = useState(false)
  const router = useRouter()
  const { showNotification } = useNotification()

  const checkBypassStatus = async () => {
    try {
      const response = await fetch('/api/auth/debug/status')
      if (response.ok) {
        const data = await response.json()
        setBypassMode(data.bypass_enabled)
      }
    } catch (error) {
      console.error('Failed to check bypass status', error)
    }
  }

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('token')
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
      setToken(storedToken)
    }
    
    checkBypassStatus()
    setLoading(false)
  }, [])

  const login = (responseData) => {
    const { user, access_token } = responseData
    setUser(user)
    setToken(access_token)
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('token', access_token)
    checkBypassStatus()
    showNotification('Logged in successfully!', 'success')
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    router.push('/login')
    showNotification('Logged out successfully!', 'success')
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      token, 
      bypassMode,
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useUser = () => useContext(AuthContext)
