import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebars";
import AnimatedBackground from "../components/AnimatedBackground";
import { useUser } from "../lib/auth";
import { motion } from "framer-motion";
import { FaStripe, FaBitcoin } from 'react-icons/fa';

const tokenPackages = [
  { amount: 6, tokens: 100, popular: false },
  { amount: 12, tokens: 220, popular: true },  // Example with bonus
  { amount: 25, tokens: 500, popular: false },
  { amount: 50, tokens: 1100, popular: false }, // Example with bonus
];

export default function Payment() {
  const { token } = useUser();
  const [selectedPackage, setSelectedPackage] = useState(tokenPackages[0]);
  const [loading, setLoading] = useState(null); // Can be 'stripe', 'binance', or null

  const handlePayment = async (method) => {
    if (!token) {
      alert("Please log in to make a payment.");
      return;
    }
    setLoading(method);

    const endpoint = method === 'stripe' 
      ? "/api/payment/create-checkout-session" 
      : "/api/payment/create-binance-order";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: selectedPackage.amount }),
      });

      if (!res.ok) {
        throw new Error('Failed to create payment session');
      }

      const data = await res.json();
      if (data.session_url) { // Stripe
        window.location.href = data.session_url;
      } else if (data.checkout_url) { // Binance
        window.location.href = data.checkout_url;
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Failed to initiate payment. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      <AnimatedBackground />
      <Navbar />
      <Sidebar />
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="ml-64 p-8 flex flex-col items-center justify-center min-h-screen"
      >
        <div className="w-full max-w-4xl bg-black bg-opacity-40 backdrop-blur-lg rounded-2xl shadow-2xl shadow-purple-500/20 border border-purple-500/30 overflow-hidden">
          <div className="p-8 md:p-12">
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 tracking-tight">
              Fuel Your AI
            </h1>
            <p className="text-center text-lg text-gray-300 mb-10">
              Choose a package that suits your needs and top up your token balance.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
              {tokenPackages.map((pkg) => (
                <motion.div
                  key={pkg.amount}
                  onClick={() => setSelectedPackage(pkg)}
                  className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                    selectedPackage.amount === pkg.amount
                      ? 'border-purple-500 bg-purple-900/40 scale-105'
                      : 'border-gray-700 bg-gray-800/50 hover:border-purple-600'
                  }`}
                  whileHover={{ y: -5 }}
                >
                  {pkg.popular && (
                    <div className="absolute top-0 right-3 -translate-y-1/2 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      POPULAR
                    </div>
                  )}
                  <p className="text-2xl font-bold">${pkg.amount}</p>
                  <p className="text-lg text-purple-400 font-semibold">{pkg.tokens.toLocaleString()} Tokens</p>
                </motion.div>
              ))}
            </div>

            <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700">
              <h2 className="text-xl font-semibold text-center mb-6">Complete Your Purchase</h2>
              <div className="flex flex-col md:flex-row gap-4">
                <motion.button
                  onClick={() => handlePayment('stripe')}
                  disabled={!!loading}
                  className="w-full flex items-center justify-center gap-3 py-4 px-6 text-lg font-semibold rounded-lg bg-[#635BFF] hover:bg-[#554fde] transition-colors disabled:opacity-50"
                  whileTap={{ scale: 0.98 }}
                >
                  <FaStripe size={24} />
                  {loading === 'stripe' ? "Redirecting..." : "Pay with Card"}
                </motion.button>
                <motion.button
                  onClick={() => handlePayment('binance')}
                  disabled={!!loading}
                  className="w-full flex items-center justify-center gap-3 py-4 px-6 text-lg font-semibold rounded-lg bg-[#F0B90B] text-black hover:bg-[#d9a60a] transition-colors disabled:opacity-50"
                  whileTap={{ scale: 0.98 }}
                >
                  <FaBitcoin size={24} />
                  {loading === 'binance' ? "Redirecting..." : "Pay with Crypto"}
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.main>
    </div>
  );
}
