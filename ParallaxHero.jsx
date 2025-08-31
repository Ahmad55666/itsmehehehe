import React, { useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";

export default function ParallaxHero({ children }) {
  const ref = useRef();
  const y = useMotionValue(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      y.set(rect.top / 4);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [y]);

  const gradient = useTransform(y, [0, 600], [
    "linear-gradient(90deg, #38b6ff 10%, #1dd1a1 90%)",
    "linear-gradient(90deg, #f7971e 10%, #ffd200 90%)"
  ]);
  return (
    <motion.section
      ref={ref}
      style={{
        background: gradient,
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden"
      }}
      className="relative"
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="z-10"
      >
        {children}
      </motion.div>
      <motion.div
        className="absolute inset-0 bg-[url('/public/images/hero-bg.svg')] bg-cover opacity-20"
        style={{ y }}
      />
    </motion.section>
  );
}