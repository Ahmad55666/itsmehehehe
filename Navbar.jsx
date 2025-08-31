// src/components/Navbar.jsx
import { useRouter } from 'next/router'
import { useUser } from '../lib/auth'
import { motion } from 'framer-motion'
import { useTheme } from '../lib/theme'
import { useState, useEffect, useRef } from 'react'

export default function Navbar() {
  const router = useRouter()
  const { pathname } = router
  const { user } = useUser()
  const { theme, toggleTheme } = useTheme()
  const isAuthenticated = !!user
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const navRef = useRef(null)
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)

  const navItems = isAuthenticated
    ? [
        { name: 'DASHBOARD', path: '/dashboard' },
        { name: 'SETTINGS', path: '/settings' }
      ]
    : [
        { name: 'HOME', path: '/' },
        { name: 'ABOUT', path: '/about' },
        { name: 'PRICING', path: '/pricing' },
        { name: 'DEMO', path: '/chatbot_demo?demo=true' },
        { name: 'CONTACT', path: '/contact' },
      ]

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!navRef.current) return;
      
      const nav = navRef.current;
      const navRect = nav.getBoundingClientRect();
      const centerX = navRect.left + navRect.width / 2;
      const centerY = navRect.top + navRect.height / 2;
      
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      
      const moveX = (mouseX - centerX) / 120;
      const moveY = (mouseY - centerY) / 120;
      
      nav.style.transform = `perspective(1000px) rotateX(${moveY}deg) rotateY(${-moveX}deg) translateZ(3px)`;
      
      setHoverPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <motion.nav
      ref={navRef}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 w-full z-50 p-4 navbar"
      style={{
        transformStyle: 'preserve-3d',
        transition: 'transform 0.4s ease-out',
        position: 'fixed',
        overflow: 'hidden'
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {isHovering && (
        <motion.div 
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            background: `radial-gradient(600px at ${hoverPosition.x}px ${hoverPosition.y}px, rgba(139, 92, 246, 0.15), transparent 80%)`,
            zIndex: -1
          }}
        />
      )}
      
      <div className="max-w-7xl mx-auto flex justify-between items-center flex-wrap px-4">
        <Logo router={router} />

        <div className="hidden md:flex flex-1 justify-center gap-10 items-center">
          {navItems.map((item) => (
            <NavLink key={item.path} item={item} router={router} />
          ))}
        </div>

        <div className="hidden md:flex gap-4 items-center">
          {!isAuthenticated && (
            <NavButton 
              onClick={() => router.push('/chatbot_demo?demo=true')}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
            >
              Try Demo
            </NavButton>
          )}
          
          <div className="flex gap-2">
            {isAuthenticated ? (
              <NavButton 
                onClick={() => router.push('/logout')} 
                className="bg-gradient-to-r from-gray-700 to-gray-800 text-white"
              >
                Logout
              </NavButton>
            ) : (
              <>
                <NavButton 
                  onClick={() => router.push('/login')} 
                  className="border border-purple-500 text-purple-300"
                >
                  Login
                </NavButton>
                <NavButton 
                  onClick={() => router.push('/signup')} 
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                >
                  Signup
                </NavButton>
              </>
            )}
          </div>
          
          <ThemeToggle toggleTheme={toggleTheme} theme={theme} />
        </div>

        <div className="md:hidden">
          <button 
            onClick={() => setIsMobileOpen(!isMobileOpen)} 
            className="text-white text-xl p-2 rounded-lg hover:bg-white/10 transition-all duration-300"
          >
            ☰
          </button>
        </div>
      </div>

      {isMobileOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden mt-4 flex flex-col gap-4 items-center backdrop-blur-xl bg-black/50 rounded-xl p-4"
        >
          {navItems.map((item) => (
            <NavLink key={item.path} item={item} router={router} />
          ))}
          <div className="flex gap-3 w-full justify-center">
            {!isAuthenticated && (
              <NavButton 
                onClick={() => router.push('/chatbot_demo?demo=true')}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
              >
                Try Demo
              </NavButton>
            )}
            <div className="flex gap-2">
              {isAuthenticated ? (
                <NavButton 
                  onClick={() => router.push('/logout')} 
                  className="bg-gradient-to-r from-gray-700 to-gray-800 text-white"
                >
                  Logout
                </NavButton>
              ) : (
                <>
                  <NavButton 
                    onClick={() => router.push('/login')} 
                    className="border border-purple-500 text-purple-300"
                  >
                    Login
                  </NavButton>
                  <NavButton 
                    onClick={() => router.push('/signup')} 
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                  >
                    Signup
                  </NavButton>
                </>
              )}
            </div>
            <ThemeToggle toggleTheme={toggleTheme} theme={theme} />
          </div>
        </motion.div>
      )}
    </motion.nav>
  )
}

function Logo({ router }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => router.push('/')}
      className="flex items-center gap-2 cursor-pointer"
    >
      <motion.div 
        className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center"
        whileHover={{ rotateY: 180 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="w-3 h-3 bg-purple-300 rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </motion.div>
      <motion.span 
        className="text-xl font-mono font-bold tracking-wide text-white"
        whileHover={{ textShadow: "0 0 10px rgba(192, 132, 252, 0.8), 0 0 20px rgba(192, 132, 252, 0.5)" }}
        transition={{ duration: 0.3 }}
      >
        NEXUS_AI
      </motion.span>
    </motion.div>
  )
}

function NavLink({ item, router }) {
  return (
    <motion.button
      whileHover={{ 
        scale: 1.05,
        y: -2,
        textShadow: "0 0 8px rgba(192, 132, 252, 0.8)"
      }}
      whileTap={{ scale: 0.95 }}
      onClick={() => router.push(item.path)}
      className={`font-mono text-sm uppercase tracking-widest transition-all duration-300 ${
        router.pathname === item.path 
          ? 'text-purple-400' 
          : 'text-white hover:text-purple-300'
      }`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {item.name}
      {router.pathname === item.path && (
        <motion.div 
          className="h-0.5 bg-purple-500 mt-1"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.button>
  )
}

function NavButton({ children, className = '', ...props }) {
  return (
    <motion.button
      whileHover={{ 
        scale: 1.05,
        y: -2,
        boxShadow: "0 5px 15px rgba(139, 92, 246, 0.4)"
      }}
      whileTap={{ scale: 0.95 }}
      className={`px-4 py-2 rounded-md font-mono text-sm uppercase tracking-wider transition-all duration-300 ${className}`}
      style={{ transformStyle: 'preserve-3d' }}
      {...props}
    >
      {children}
    </motion.button>
  )
}
function ThemeToggle({ toggleTheme, theme }) {
  return (
    <button 
      onClick={toggleTheme} 
      className="p-2 rounded-lg hover:bg-white/10 transition-all duration-300"
      aria-label="Toggle Theme"
    >
      {theme === 'dark' ? (
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-7.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z" />
        </svg>
      ) : (
        <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-7.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z" />
        </svg>
      )}
    </button>
  )
}