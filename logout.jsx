import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useUser } from '../lib/auth'

export default function Logout() {
  const { logout } = useUser() || {}
  const router = useRouter()

  useEffect(() => {
    // Call logout if available, then redirect to login
    try {
      if (typeof logout === 'function') logout()
    } catch (e) {
      // ignore
    }
    // replace so back doesn't return to protected page
    router.replace('/login')
  }, [])

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-lg">Signing out...</div>
    </div>
  )
}
