import { useState } from 'react'
import { useRouter } from 'next/router'
import { useUser } from '../lib/auth'
import { motion } from 'framer-motion'
import Link from 'next/link'
import LuxuryAuthBackground from '../components/LuxuryAuthBackground';

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showResend, setShowResend] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const { login } = useUser()
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })
      
      if (!res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await res.json();
          throw new Error(errorData.detail || 'Login failed');
        } else {
          const text = await res.text();
          throw new Error(`Server error: ${text.slice(0, 100)}`);
        }
      }
      
      const responseData = await res.json()
      
      if (responseData.requires_verification) {
        setError("Email not verified. Check your inbox...")
        setShowResend(true)
      } else {
        login(responseData)
        router.push('/dashboard')
      }
    } catch (err) {
      setError(err.message)
      if (err.message.includes("not verified")) {
        setShowResend(true)
      }
    } finally {
      setLoading(false)
    }
  }
  
  const handleResendVerification = async () => {
    setResendLoading(true)
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email })
      })
      
      if (!res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await res.json();
          throw new Error(errorData.detail || 'Failed to resend email');
        } else {
          const text = await res.text();
          throw new Error(`Server error: ${text.slice(0, 100)}`);
        }
      }
      
      setResendSuccess(true)
      setTimeout(() => setResendSuccess(false), 5000)
    } catch (err) {
      setError(err.message)
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <LuxuryAuthBackground />

      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/90 via-[#121316]/80 to-[#1a1c23]/90 z-0 pt-16"></div>
      
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
              Welcome Back
            </motion.h1>
            <motion.p 
              className="text-[#e0e0ff] mt-2 relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Sign in to your account
            </motion.p>
          </div>
          
          <div className="p-8">
            {error && (
              <motion.div 
                className="mb-6 p-3 bg-red-900/30 border border-red-700/50 rounded-lg text-red-400 text-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
                {error.includes("not verified") && (
                  <button 
                    onClick={handleResendVerification}
                    disabled={resendLoading || resendSuccess}
                    className={`mt-2 text-[#8b5cf6] hover:underline flex items-center justify-center w-full ${
                      resendSuccess ? 'text-green-400' : ''
                    }`}
                  >
                    {resendLoading ? 'Sending...' : resendSuccess ? 'Email Sent!' : 'Resend Verification Email'}
                  </button>
                )}
              </motion.div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <label className="block text-gray-400 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#161b20] px-4 py-3 rounded-lg text-white border border-[#2d2f3a] focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]/50 outline-none transition"
                  required
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
              >
                <label className="block text-gray-400 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                    {loading ? 'Signing In...' : 'Sign In'}
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-[#9d4edd] to-[#38b6ff] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </button>
              </motion.div>
            </form>
            
            <motion.div 
              className="mt-8 text-center text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
            >
              <Link href="/reset-password" className="block text-[#8b5cf6] hover:underline hover:text-[#38b6ff] transition mb-2">
                Forgot Password?
              </Link>
              Don't have an account?{' '}
              <Link href="/signup" className="text-[#8b5cf6] hover:underline hover:text-[#38b6ff] transition">
                Sign up
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
      
      <motion.div
        className="absolute bottom-8 right-8 z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <div className="bg-[#1a1c23]/80 backdrop-blur-md rounded-xl p-4 border border-[#2d2f3a]">
          <p className="text-gray-300 mb-2">Just want to explore?</p>
          <Link href="/chatbot_demo?demo=true" className="text-[#38b6ff] hover:underline flex items-center">
            Try Demo Mode 
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
