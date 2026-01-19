import React from 'react'
import { motion } from 'framer-motion'

export function StatsCard({ label, value, icon: Icon, delay = 0 }) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.5,
        delay,
      }}
      className="group relative overflow-hidden rounded-2xl border border-stone-200 dark:border-white/10 bg-white/80 dark:bg-white/5 p-6 backdrop-blur-xl shadow-lg shadow-stone-900/5 dark:shadow-none transition-all duration-300 hover:bg-white dark:hover:bg-white/10 hover:shadow-xl hover:shadow-blue-500/10 dark:hover:shadow-blue-900/20 hover:scale-[1.02] hover:-translate-y-0.5"
    >
      <div className="relative z-10 flex flex-col">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-medium text-stone-500 dark:text-gray-400 uppercase tracking-wider">
            {label}
          </span>
          {Icon && (
            <Icon className="h-5 w-5 text-blue-500 dark:text-blue-400/70" />
          )}
        </div>
        <div className="text-4xl font-light text-stone-900 dark:text-white tracking-tight">
          {value}
        </div>
      </div>

      {/* Subtle gradient glow effect on hover */}
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-500/10 dark:bg-blue-500/10 blur-3xl transition-opacity duration-500 opacity-0 group-hover:opacity-100" />
    </motion.div>
  )
}
