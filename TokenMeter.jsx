// src/components/TokenMeter.jsx
import React from "react";
import { motion } from "framer-motion";

export default function TokenMeter({ tokens, onBuyClick }) {
  return (
    <motion.div 
      className="relative bg-gray-800/50 border border-purple-500/30 rounded-xl p-4"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-gray-400 text-sm">Available Tokens</span>
        <span className="text-xs bg-purple-900/50 text-purple-400 px-2 py-1 rounded">
          Free
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        <motion.div 
          className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full flex items-center justify-center"
          animate={{ rotateY: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <span className="text-white">🪙</span>
        </motion.div>
        <div>
          <p className="text-2xl font-bold text-white">{tokens}</p>
        </div>
      </div>
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onBuyClick}
        className="mt-3 w-full py-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg text-sm font-medium"
      >
        Buy More
      </motion.button>
      
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-blue-400 rounded-full"
          style={{
            top: `${Math.random() * 80 + 10}%`,
            left: `${Math.random() * 80 + 10}%`,
          }}
          animate={{
            y: [0, -10, 0],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2 + Math.random() * 3,
            repeat: Infinity,
            delay: i * 0.5,
          }}
        />
      ))}
    </motion.div>
  );
}