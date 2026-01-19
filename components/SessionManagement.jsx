import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, RefreshCw, Plus } from 'lucide-react'

export function SessionManagement({
  currentSession,
  onNewSession,
  onRefresh,
  isLoadingStats,
}) {
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
        delay: 0.5,
      }}
      className="rounded-2xl border border-stone-200 dark:border-white/10 bg-white/80 dark:bg-white/5 p-6 backdrop-blur-xl shadow-lg shadow-stone-900/5 dark:shadow-none"
    >
      <div className="mb-6">
        <h3 className="text-lg font-medium text-stone-900 dark:text-white">
          Session Control
        </h3>
        <div className="mt-4 rounded-xl border border-stone-200 dark:border-white/5 bg-stone-50 dark:bg-white/5 p-4">
          <div className="flex items-start gap-3">
            <div className="mt-1 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 p-2 text-blue-600 dark:text-blue-400">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-500 dark:text-gray-400">
                {currentSession ? 'Active Session' : 'No Session'}
              </p>
              {currentSession ? (
                <>
                  <h4 className="mt-1 text-base font-semibold text-stone-900 dark:text-white">
                    {currentSession.title}
                  </h4>
                  <p className="mt-1 text-xs text-stone-500 dark:text-gray-500">
                    Started: {new Date(currentSession.date).toLocaleDateString()} •{' '}
                    {new Date(currentSession.date).toLocaleTimeString()}
                  </p>
                </>
              ) : (
                <p className="mt-1 text-sm text-stone-600 dark:text-gray-400">
                  Create a new session to start tracking attendance
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onNewSession}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-white/5 px-4 py-3 text-sm font-medium text-stone-700 dark:text-white transition-all hover:bg-white dark:hover:bg-white/10 hover:border-stone-300 dark:hover:border-white/20 hover:shadow-md hover:shadow-stone-900/5 dark:hover:shadow-none active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>New Session</span>
        </button>
        <button
          onClick={onRefresh}
          disabled={isLoadingStats}
          className="flex items-center justify-center gap-2 rounded-xl border border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-white/5 px-4 py-3 text-sm font-medium text-stone-600 dark:text-gray-300 transition-all hover:bg-white dark:hover:bg-white/10 hover:text-stone-900 dark:hover:text-white hover:shadow-md hover:shadow-stone-900/5 dark:hover:shadow-none active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoadingStats ? 'animate-spin' : ''}`} />
          <span className="sr-only">Refresh</span>
        </button>
      </div>
    </motion.div>
  )
}
