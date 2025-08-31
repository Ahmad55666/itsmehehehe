import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import LuxuryAuthBackground from '../components/LuxuryAuthBackground'

export default function ResetPassword() {
  const router = useRouter()
  const { token } = router.query
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tokenValid, setTokenValid] = useState(null)

  useEffect(() => {
    if (!token) {
      setTokenValid(false)
      setError('Invalid reset link')
      return
    }

    // Handle special bypass token
    if (token === "bypass") {
      setTokenValid(true)
      return
    }

    const verifyToken = async () => {
      try {
        const res = await fetch(`/api/auth/verify-reset-token?token=${token}`, {
          headers: {'Accept': 'application/json'}
        })
        
        if (!res.ok) {
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Token verification failed');
          } else {
            const text = await res.text();
            throw new Error(`Server error: ${text.slice(0, 100)}`);
          }
        }
        
        const data = await res.json()
        if (data.valid) {
          setTokenValid(true)
        } else {
          setTokenValid(false)
          setError(data.message || 'Invalid or expired token')
        }
      } catch (err) {
        setTokenValid(false)
        setError(err.message || 'Failed to verify token')
      }
    }

    verifyToken()
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!tokenValid) {
      setError('Invalid token')
      return
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      // Use "bypass" token if in bypass mode
      const resetToken = token === "bypass" ? "bypass" : token
      
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          token: resetToken, 
          new_password: password 
        })
      })
      
      if (!res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await res.json();
          throw new Error(errorData.detail || 'Password reset failed');
        } else {
          const text = await res.text();
          throw new Error(`Server error: ${text.slice(0, 100)}`);
        }
      }
      
      setSuccess(true)
      setTimeout(() => router.push('/login'), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

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
            <motion.h1 
              className="text-3xl font-bold text-white relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Set New Password
            </motion.h1>
            <motion.p 
              className="text-[#e0e0ff] mt-2 relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Create a new password for your account
            </motion.p>
            {token === "bypass" && (
              <div className="absolute top-2 right-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded">
                Bypass Mode
              </div>
            )}
          </div>
          
          <div className="p-8">
            {tokenValid === false ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center py-8"
              >
                <div className="bg-gradient-to-r from-[#8b5cf6] to-[#38b6ff] text-transparent bg-clip-text text-5xl mb-4">
                  <i className="fas fa-exclamation-circle"></i>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Invalid Link</h2>
                <p className="text-gray-300 mb-4">
                  {error || 'This password reset link is invalid or has expired.'}
                </p>
                <button
                  onClick={() => router.push('/login')}
                  className="bg-gradient-to-r from-[#8b5cf6] to-[#38b6ff] text-white font-bold px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-[#8b5cf6]/30 transition-all duration-300"
                >
                  Back to Login
                </button>
              </motion.div>
            ) : success ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center py-8"
              >
                <div className="bg-gradient-to-r from-[#8b5cf6] to-[#38b6ff] text-transparent bg-clip-text text-5xl mb-4">
                  <i className="fas fa-check-circle"></i>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {token === "bypass" ? "Bypass Successful!" : "Password Updated!"}
                </h2>
                <p className="text-gray-300">
                  {token === "bypass" 
                    ? "Password reset bypassed successfully. Redirecting to login..." 
                    : "Your password has been successfully reset. Redirecting to login..."}
                </p>
              </motion.div>
            ) : (
              <>
                {error && (
                  <motion.div 
                    className="mb-6 p-3 bg-red-900/30 border border-red-700/50 rounded-lg text-red-400 text-center"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {error}
                  </motion.div>
                )}
                
                {tokenValid === null ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#8b5cf6] mx-auto mb-4"></div>
                    <h2 className="text-xl font-bold text-white">
                      {token === "bypass" ? "Bypass Mode" : "Verifying your link..."}
                    </h2>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      <label className="block text-gray-400 mb-2">New Password</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-[#161b20] px-4 py-3 rounded-lg text-white border border-[#2d2f3a] focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]/50 outline-none transition"
                        required
                      />
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 }}
                    >
                      <label className="block text-gray-400 mb-2">Confirm Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-[#161b20] px-4 py-3 rounded-lg text-white border border-[#2d2f3a] focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]/50 outline-none transition"
                        required
                      />
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.1 }}
                      className="pt-2"
                    >
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-[#8b5cf6] to-[#38b6ff] text-white font-bold px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-[#8b5cf6]/30 transition-all duration-300 relative overflow-hidden group"
                      >
                        <span className="relative z-10">
                          {loading ? 'Updating...' : 'Reset Password'}
                        </span>
                        <span className="absolute inset-0 bg-gradient-to-r from-[#9d4edd] to-[#38b6ff] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      </button>
                    </motion.div>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}