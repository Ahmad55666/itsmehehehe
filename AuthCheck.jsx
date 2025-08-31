import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useUser } from '../lib/auth'

const protectedRoutes = [
  '/dashboard',
  '/settings'
]

const authRoutes = [
  '/login',
  '/signup'
]

export default function AuthCheck({ children }) {
  const { user, loading: userLoading } = useUser()
  const router = useRouter()
  const [systemStatus, setSystemStatus] = useState({
    loading: true,
    autoVerifyActive: false,
    bypassEnabled: false
  })

  useEffect(() => {
    const checkSystem = async () => {
      try {
        const res = await fetch('/api/auth/debug/status')
        const data = await res.json()
        setSystemStatus({
          loading: false,
          autoVerifyActive: data.auto_verify_enabled,
          bypassEnabled: data.bypass_enabled
        })
      } catch (error) {
        console.error("Failed to check system status:", error)
        setSystemStatus({
          loading: false,
          autoVerifyActive: false,
          bypassEnabled: false
        })
      }
    }
    checkSystem()
  }, [])

  useEffect(() => {
    if (systemStatus.loading || userLoading || !router.isReady) return

    const isProtected = protectedRoutes.some(route => 
      router.pathname.startsWith(route)
    )
    const isAuthRoute = authRoutes.includes(router.pathname)

    // If user is authenticated and trying to access auth routes, redirect to dashboard
    if (user && isAuthRoute) {
      router.push('/dashboard')
      return
    }

    // If not a protected route, allow access
    if (!isProtected) {
      return
    }

    // If no user and trying to access protected route, redirect to login
    if (!user) {
      router.push('/login')
      return
    }

    // USER IS AUTHENTICATED - CHECK VERIFICATION STATUS
    
    // If auto-verify is active OR bypass is enabled, user is considered verified
    const isEffectivelyVerified = user.is_verified || 
                                 systemStatus.autoVerifyActive || 
                                 systemStatus.bypassEnabled

    // If user is effectively verified, allow access to protected routes
    if (isEffectivelyVerified) {
      return
    }

    // Only redirect to verification if BOTH bypass modes are disabled AND user is not verified
    if (!systemStatus.autoVerifyActive && !systemStatus.bypassEnabled && !user.is_verified) {
      router.push('/verify-email')
    }
  }, [user, userLoading, systemStatus, router])

  if (systemStatus.loading || userLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-2xl">Loading security system...</div>
      </div>
    )
  }

  return children
}
