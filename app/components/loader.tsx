"use client"

import { motion } from "framer-motion"

export default function Loader({ onComplete }: { onComplete: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{
        duration: 1.2,
        delay: 2.5,
        ease: "easeInOut",
      }}
      onAnimationComplete={onComplete}
    >
      <div className="relative w-40">
        <motion.div
          className="h-px w-full bg-white"
          initial={{ scaleX: 0, opacity: 0.5 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{
            duration: 2,
            ease: "easeInOut",
          }}
        />
      </div>
    </motion.div>
  )
}
