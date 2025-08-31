// src/components/Sidebar.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useUser } from '../lib/auth';

export default function Sidebar() {
  const router = useRouter();
  const { user, logout } = useUser();
  const [isExpanded, setIsExpanded] = useState(true);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Demo', path: '/demo', icon: '🤖' },
    { name: 'Settings', path: '/settings', icon: '⚙️' },
    { name: 'Billing', path: '/payment', icon: '💳' },
  ];

  return (
    <motion.div 
      className={`fixed top-0 left-0 h-full bg-gray-900/90 backdrop-blur-md z-40 border-r border-purple-500/30 ${isExpanded ? 'w-64' : 'w-20'}`}
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
    >
      <div className="h-full flex flex-col">
        <div 
          className="p-6 border-b border-purple-500/30 cursor-pointer flex items-center gap-3"
          onClick={() => router.push('/dashboard')}
        >
          <div className="bg-purple-600 w-10 h-10 rounded-lg flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-purple-300 animate-pulse" />
          </div>
          {isExpanded && <h1 className="text-xl font-bold text-white font-mono tracking-wider">NEXUS_AI</h1>}
        </div>

        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute top-6 right-0 translate-x-1/2 bg-purple-600 w-8 h-8 rounded-full flex items-center justify-center"
        >
          {isExpanded ? '«' : '»'}
        </button>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <motion.li
                key={item.path}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <button
                  onClick={() => router.push(item.path)}
                  className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    router.pathname === item.path 
                      ? 'bg-purple-900/50 text-purple-400'
                      : 'text-gray-300 hover:bg-gray-800/50'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  {isExpanded && <span>{item.name}</span>}
                </button>
              </motion.li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-purple-500/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
              {user?.email.charAt(0).toUpperCase()}
            </div>
            {isExpanded && (
              <div>
                <p className="font-medium text-white">{user?.email}</p>
                <p className="text-xs text-gray-400">Free Plan</p>
              </div>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={logout}
            className="w-full py-2 bg-gray-800/50 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-700/50 transition-colors"
          >
            {isExpanded ? 'Logout' : '🚪'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
