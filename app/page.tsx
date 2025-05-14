"use client"

import Hero from "./components/hero"
import { motion } from "framer-motion"

export default function Page() {
  return (
    <motion.main
      className="min-h-screen bg-black text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <Hero />
    </motion.main>
  )
}
