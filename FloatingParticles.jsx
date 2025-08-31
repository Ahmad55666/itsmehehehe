import { motion } from 'framer-motion'

export default function FloatingParticles({ count = 20 }) {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            x: [0, Math.random() * 100 - 50, 0],
            y: [0, Math.random() * 100 - 50, 0],
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{
            duration: 10 + Math.random() * 20,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut'
          }}
          className={`absolute rounded-full ${
            i % 3 === 0 ? 'bg-blue-500' : 
            i % 3 === 1 ? 'bg-teal-500' : 'bg-purple-500'
          }`}
          style={{
            width: `${5 + Math.random() * 10}px`,
            height: `${5 + Math.random() * 10}px`,
            filter: 'blur(1px)',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`
          }}
        />
      ))}
    </>
  )
}