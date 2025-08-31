import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import LuxuryAuthBackground from '../components/LuxuryAuthBackground'

export default function VerifyEmail() {
  const router = useRouter()
  const { token } = router.query
  const [status, setStatus] = useState('checking')
  const [error, setError] = useState('')
  const [systemStatus, setSystemStatus] = useState({
    loading: true,
    autoVerifyActive: false,
    bypassEnabled: false
  })

  useEffect(() => {
    const checkSystemStatus = async () => {
      try {
        const response = await fetch('/api/auth/debug/status');
        if (response.ok) {
          const data = await response.json();
          setSystemStatus({
            loading: false,
            autoVerifyActive: data.auto_verify_enabled,
            bypassEnabled: data.bypass_enabled
          });
        } else {
          setSystemStatus({
            loading: false,
            autoVerifyActive: false,
            bypassEnabled: false
          });
        }
      } catch (error) {
        console.error("System status check failed:", error);
        setSystemStatus({
          loading: false,
          autoVerifyActive: false,
          bypassEnabled: false
        });
      }
    };
    
    checkSystemStatus();
  }, []);

  useEffect(() => {
    if (systemStatus.loading) return;

    // If bypass modes are active, redirect immediately to dashboard
    if (systemStatus.autoVerifyActive || systemStatus.bypassEnabled) {
      setStatus('bypassed');
      setTimeout(() => router.push('/dashboard'), 2000);
      return;
    }

    const verifyToken = async () => {
      try {
        // Handle special bypass token
        if (token === "bypass") {
          setStatus('success')
          setTimeout(() => router.push('/dashboard'), 3000)
          return
        }
        
        if (!token) {
          setError('Missing verification token')
          setStatus('error')
          return
        }

        setStatus('verifying')
        
        const res = await fetch(`/api/auth/verify-email?token=${token}`, {
          headers: {'Accept': 'application/json'}
        })
        
        if (!res.ok) {
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await res.json();
            throw new Error(errorData.detail || 'Verification failed');
          } else {
            const text = await res.text();
            throw new Error(`Server error: ${text.slice(0, 100)}`);
          }
        }
        
        setStatus('success')
        setTimeout(() => router.push('/dashboard'), 3000)
      } catch (err) {
        setError(err.message)
        setStatus('error')
      }
    }
    
    verifyToken()
  }, [token, router, systemStatus])

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <LuxuryAuthBackground />
      
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/90 via-[#121316]/80 to-[#1a1c23]/90 z-0"></div>
      
      <motion.div 
        className="relative z-10 w-full max-w-md px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="bg-[#1a1c23]/80 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-[#2d2f3a]">
          <div className="bg-gradient-to-r from-[#8b5cf6] to-[#38b6ff] p-6 text-center relative">
            <div className="absolute inset-0 bg-[url('/images/grid-pattern.png')] opacity-20"></div>
            <motion.h1 
              className="text-3xl font-bold text-white relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Email Verification
            </motion.h1>
          </div>
          
          <div className="p-8 text-center">
            {status === 'checking' ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#8b5cf6] mx-auto mb-4"></div>
                <h2 className="text-xl font-bold text-white">Checking system status...</h2>
              </motion.div>
            ) : status === 'bypassed' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="bg-gradient-to-r from-[#8b5cf6] to-[#38b6ff] text-transparent bg-clip-text text-5xl mb-4">
                  <i className="fas fa-check-circle"></i>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Verification Bypassed!</h2>
                <p className="text-gray-300 mb-2">
                  Development mode is active. Verification not required.
                </p>
                <p className="text-yellow-400 text-sm">
                  {systemStatus.autoVerifyActive && "Auto-verify enabled"}
                  {systemStatus.autoVerifyActive && systemStatus.bypassEnabled && " & "}
                  {systemStatus.bypassEnabled && "Bypass mode enabled"}
                </p>
              </motion.div>
            ) : status === 'verifying' ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#8b5cf6] mx-auto mb-4"></div>
                <h2 className="text-xl font-bold text-white">Verifying your email...</h2>
                {token === "bypass" && (
                  <p className="text-gray-400 mt-2">Using verification bypass</p>
                )}
              </motion.div>
            ) : status === 'success' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="bg-gradient-to-r from-[#8b5cf6] to-[#38b6ff] text-transparent bg-clip-text text-5xl mb-4">
                  <i className="fas fa-check-circle"></i>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {token === "bypass" ? "Bypass Successful!" : "Email Verified!"}
                </h2>
                <p className="text-gray-300">
                  {token === "bypass" 
                    ? "Verification bypassed successfully. Redirecting to dashboard..." 
                    : "Your email has been successfully verified. Redirecting to dashboard..."}
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="bg-gradient-to-r from-[#8b5cf6] to-[#38b6ff] text-transparent bg-clip-text text-5xl mb-4">
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Verification Failed</h2>
                <p className="text-gray-300 mb-4">
                  {error || 'There was a problem verifying your email address.'}
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="bg-gradient-to-r from-[#8b5cf6] to-[#38b6ff] text-white font-bold px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-[#8b5cf6]/30 transition-all duration-300"
                  >
                    Go to Dashboard
                  </button>
                  <button
                    onClick={() => router.push('/login')}
                    className="border border-gray-500 text-gray-300 hover:bg-gray-500/10 font-bold px-6 py-3 rounded-lg transition-all duration-300"
                  >
                    Back to Login
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}