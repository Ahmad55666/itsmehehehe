// src/pages/checkout.jsx
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebars';
import AnimatedBackground from '../components/AnimatedBackground';
import { motion } from 'framer-motion';

export default function Checkout() {
  const [tokens, setTokens] = useState(100);
  const [paymentMethod, setPaymentMethod] = useState('stripe');

  const tokenPackages = [
    { amount: 100, price: 6 },
    { amount: 500, price: 25 },
    { amount: 1000, price: 45 },
    { amount: 5000, price: 200 },
  ];

  const handlePurchase = () => {
    alert(`Purchased ${tokens} tokens!`);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-color)] relative">
      <AnimatedBackground />
      <Navbar />
      <Sidebar />
      <main className="ml-64 p-6">
        <div className="max-w-4xl mx-auto bg-gray-800/50 border border-purple-500/30 rounded-xl p-8">
          <h1 className="text-3xl font-bold mb-2">Buy Tokens</h1>
          <p className="text-gray-400 mb-8">Get tokens to power your AI chatbot interactions</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-bold mb-4">Token Packages</h2>
              <div className="space-y-4">
                {tokenPackages.map((pkg, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.03 }}
                    className={`p-4 rounded-lg cursor-pointer ${
                      tokens === pkg.amount 
                        ? 'bg-purple-900/50 border border-purple-500' 
                        : 'bg-gray-900/50 hover:bg-gray-800/50'
                    }`}
                    onClick={() => setTokens(pkg.amount)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-lg">{pkg.amount} tokens</h3>
                        <p className="text-gray-400">${pkg.price} USD</p>
                      </div>
                      <div className="bg-purple-600 w-8 h-8 rounded-full flex items-center justify-center">
                        <span className="text-white">🪙</span>
                      </div>
                    </div>
                    {tokens === pkg.amount && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-2 text-sm text-purple-400"
                      >
                        Selected
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-bold mb-4">Payment Information</h2>
              
              <div className="mb-6">
                <label className="block text-gray-400 mb-2">Payment Method</label>
                <div className="flex gap-4">
                  <button
                    className={`px-4 py-2 rounded-lg ${
                      paymentMethod === 'stripe' 
                        ? 'bg-blue-600' 
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                    onClick={() => setPaymentMethod('stripe')}
                  >
                    Credit Card
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg ${
                      paymentMethod === 'crypto' 
                        ? 'bg-blue-600' 
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                    onClick={() => setPaymentMethod('crypto')}
                  >
                    Crypto
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-900/50 p-4 rounded-lg mb-6">
                <div className="flex justify-between mb-2">
                  <span>Tokens:</span>
                  <span>{tokens} 🪙</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Price:</span>
                  <span>${tokenPackages.find(p => p.amount === tokens)?.price || 0} USD</span>
                </div>
                <div className="border-t border-gray-700 my-3"></div>
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>${tokenPackages.find(p => p.amount === tokens)?.price || 0} USD</span>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePurchase}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg text-lg font-bold"
              >
                Purchase Tokens
              </motion.button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}