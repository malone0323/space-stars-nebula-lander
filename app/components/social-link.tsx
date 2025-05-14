"use client"
import { motion } from "framer-motion"

interface SocialLinkProps {
  href: string
  label: string
}

export function SocialLink({ href, label }: SocialLinkProps) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center text-white hover:text-white/80 transition-colors pointer-events-auto"
      aria-label={label}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.1 }}
      transition={{ duration: 0.2 }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1227" width="16" height="16" fill="currentColor">
        <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z" />
      </svg>
    </motion.a>
  )
}
