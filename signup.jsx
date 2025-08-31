import { useState } from 'react'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import Link from 'next/link'
import LuxuryAuthBackground from '../components/LuxuryAuthBackground';
import { useNotification } from '../lib/notifications';

export default function Signup() {
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    confirmPassword: '',
    business_id: 1
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [showVerificationMessage, setShowVerificationMessage] = useState(false)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false);
  const { showNotification } = useNotification();


  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Signup error:", text);
      showNotification(`Signup failed: ${text}`, 'error');
      setIsLoading(false);
      return;
    }

    let data = {};
    try {
      data = await res.json();
    } catch (jsonErr) {
      const raw = await res.text();
      console.error("Non-JSON response:", raw);
      alert("Signup failed: Invalid server response");
      setIsLoading(false);
      return;
    }

    // Handle verification bypass or normal flow
    if (data.message?.toLowerCase().includes("bypass")) {
      alert("Account created without email verification.");
      router.push("/login");
    } else if (data.message?.toLowerCase().includes("email sent")) {
      setShowVerificationMessage(true);
    } else {
      alert("Account created successfully.");
      router.push("/login");
    }

  } catch (err) {
    console.error("Unexpected error:", err);
    alert("Signup failed. Check your internet or try again.");
  } finally {
    setIsLoading(false);
  }
};


  const nextStep = () => {
    if (step === 1 && (!formData.fullname || !formData.email)) {
      setError('Please fill in all fields')
      return
    }
    setStep(step + 1)
    setError('')
  }

  const prevStep = () => {
    setStep(step - 1)
    setError('')
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
              Create Account
            </motion.h1>
            <motion.p 
              className="text-[#e0e0ff] mt-2 relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Join our platform
            </motion.p>
            
            <div className="flex justify-center mt-4 space-x-2 relative">
              {[1, 2].map((i) => (
                <div 
                  key={i}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${i <= step ? 'bg-white' : 'bg-white/30'}`}
                />
              ))}
            </div>
          </div>
          
          <div className="p-8">
            {showVerificationMessage ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center py-8"
              >
                <div className="bg-gradient-to-r from-[#8b5cf6] to-[#38b6ff] text-transparent bg-clip-text text-5xl mb-4">
                  <i className="fas fa-envelope-open-text"></i>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Verify Your Email</h2>
                <p className="text-gray-300 mb-6">
                  We've sent a verification link to <span className="text-[#8b5cf6]">{formData.email}</span>.
                  Please check your inbox to activate your account.
                </p>
                <button
                  onClick={() => router.push('/login')}
                  className="bg-gradient-to-r from-[#8b5cf6] to-[#38b6ff] text-white font-bold px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-[#8b5cf6]/30 transition-all duration-300"
                >
                  Continue to Login
                </button>
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
                
                <form onSubmit={handleSubmit}>
                  {step === 1 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-6"
                    >
                      <div>
                        <label className="block text-gray-400 mb-2">Full Name</label>
                        <input
                          type="text"
                          name="fullname"
                          value={formData.fullname}
                          onChange={handleChange}
                          className="w-full bg-[#161b20] px-4 py-3 rounded-lg text-white border border-[#2d2f3a] focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]/50 outline-none transition"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-400 mb-2">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full bg-[#161b20] px-4 py-3 rounded-lg text-white border border-[#2d2f3a] focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]/50 outline-none transition"
                          required
                        />
                      </div>
                      
                      <button
                        type="button"
                        onClick={nextStep}
                        className="w-full bg-gradient-to-r from-[#8b5cf6] to-[#38b6ff] text-white font-bold px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-[#8b5cf6]/30 transition-all duration-300 mt-6"
                      >
                        Continue
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-6"
                    >
                      <div>
                        <label className="block text-gray-400 mb-2">Password</label>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className="w-full bg-[#161b20] px-4 py-3 rounded-lg text-white border border-[#2d2f3a] focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]/50 outline-none transition"
                          required
                        />
                        <div className="mt-2 text-xs text-gray-500">
                          Must be at least 8 characters
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-gray-400 mb-2">Confirm Password</label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="w-full bg-[#161b20] px-4 py-3 rounded-lg text-white border border-[#2d2f3a] focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]/50 outline-none transition"
                          required
                        />
                      </div>
                      
                      <div className="flex space-x-4">
                        <button
                          type="button"
                          onClick={prevStep}
                          className="flex-1 bg-[#2d2f3a] text-white font-bold px-6 py-3 rounded-lg hover:bg-[#3d3f4a] transition"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 bg-gradient-to-r from-[#8b5cf6] to-[#38b6ff] text-white font-bold px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-[#8b5cf6]/30 transition-all duration-300 relative overflow-hidden group"
                        >
                          <span className="relative z-10">
                            {loading ? 'Creating Account...' : 'Sign Up'}
                          </span>
                          <span className="absolute inset-0 bg-gradient-to-r from-[#9d4edd] to-[#38b6ff] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </form>
                
                <motion.div 
                  className="mt-8 text-center text-gray-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.3 }}
                >
                  Already have an account?{' '}
                  <Link href="/login" className="text-[#8b5cf6] hover:underline hover:text-[#38b6ff] transition">
                    Sign in
                  </Link>
                </motion.div>
              </>
            )}
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
          <p className="text-gray-300 mb-2">Just want to try?</p>
          <Link href="/chatbot_demo?demo=true" className="text-[#38b6ff] hover:underline flex items-center">
            Try Demo Mode 
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="CurrentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
