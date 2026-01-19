import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  UserCheck,
  UserPlus,
  UserX,
  LayoutDashboard,
  Moon,
  Sun,
} from 'lucide-react'
import axios from 'axios'
import { StatsCard } from '../components/StatsCard'
import { MemberRollCall } from '../components/MemberRollCall'
import { QRSection } from '../components/QRSection'
import { AttendanceActions } from '../components/AttendanceActions'
import { SessionManagement } from '../components/SessionManagement'
import MemberModal from '../components/MemberModal'
import { useTheme } from '../hooks/useTheme'

const RegisterMemberModal = ({ open, onClose, onRegister }) => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return alert('Name is required')
    if (!phone.trim()) return alert('Phone is required')

    setLoading(true)
    try {
      await onRegister({ name, email, phone, address })
    } finally {
      setLoading(false)
      setName('')
      setEmail('')
      setPhone('')
      setAddress('')
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-white/10 rounded-2xl p-6 w-full max-w-md border border-stone-200 dark:border-white/10 backdrop-blur-xl"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-stone-900 dark:text-white">
            Register New Member
          </h3>
          <button
            onClick={onClose}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-gray-300 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter full name"
              className="w-full p-2 border border-stone-200 dark:border-white/10 rounded-lg bg-stone-50 dark:bg-black/20 text-stone-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-gray-300 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number"
              className="w-full p-2 border border-stone-200 dark:border-white/10 rounded-lg bg-stone-50 dark:bg-black/20 text-stone-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              className="w-full p-2 border border-stone-200 dark:border-white/10 rounded-lg bg-stone-50 dark:bg-black/20 text-stone-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-gray-300 mb-1">
              Address
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter address"
              rows="3"
              className="w-full p-2 border border-stone-200 dark:border-white/10 rounded-lg bg-stone-50 dark:bg-black/20 text-stone-900 dark:text-white"
            />
          </div>

          <div className="flex gap-2 mt-4 pt-2 border-t border-stone-200 dark:border-white/10">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-500 transition-all disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register & Mark Present'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-stone-300 dark:bg-white/10 text-stone-900 dark:text-white px-4 py-2 rounded-lg hover:bg-stone-400 dark:hover:bg-white/20 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default function Home() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
  const { theme, toggleTheme } = useTheme()
  const [session, setSession] = useState(null)
  const [stats, setStats] = useState({
    totalMembers: 0,
    presentToday: 0,
    firstTimers: 0,
    absent: 0,
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [allMembers, setAllMembers] = useState([])
  const [memberStatus, setMemberStatus] = useState({})
  const [filteredMembers, setFilteredMembers] = useState([])
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState(null)
  const [loadingStats, setLoadingStats] = useState(false)
  const [loadingPresent, setLoadingPresent] = useState(null)

  useEffect(() => {
    refreshStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, apiUrl])

  useEffect(() => {
    // Filter members based on search query
    if (searchQuery.trim()) {
      setFilteredMembers(
        allMembers.filter((m) =>
          m.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    } else {
      setFilteredMembers([])
    }
  }, [searchQuery, allMembers])

  async function refreshStats() {
    if (!apiUrl) return
    setLoadingStats(true)
    try {
      // Fetch all members
      const mRes = await axios.get(`${apiUrl}/api/members`)
      const members = mRes.data.members || []
      setAllMembers(members)

      // Fetch current attendance
      const aRes = await axios.get(`${apiUrl}/api/attendance/current`)
      const allAttendance = aRes.data || []

      const sessionId = session && (session._id || session.id)
      const sessionAttendance = sessionId
        ? allAttendance.filter(
            (r) =>
              r.sessionId && (r.sessionId._id || r.sessionId) === sessionId
          )
        : []
      const presentCount = sessionAttendance.length

      // Build session attendance map
      const memberSessionAttendance = {}
      sessionAttendance.forEach((r) => {
        const mid = r.memberId && (r.memberId._id || r.memberId)
        if (mid) {
          memberSessionAttendance[mid] = true
        }
      })

      // Determine status for each member
      const statusMap = {}
      const now = new Date()
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      let firstTimersCount = 0

      members.forEach((m) => {
        const mid = m._id
        const isPresent = memberSessionAttendance[mid]

        if (isPresent) {
          statusMap[mid] = 'Present'
        } else {
          // Check if first timer (registered < 24 hours ago)
          const registrationDate = m.first_scan_date
            ? new Date(m.first_scan_date)
            : null
          const isFirstTimer =
            registrationDate && registrationDate > twentyFourHoursAgo

          if (isFirstTimer) {
            statusMap[mid] = 'New'
            firstTimersCount++
          } else {
            statusMap[mid] = 'Absent'
          }
        }
      })

      setMemberStatus(statusMap)

      const absentCount = members.length - presentCount

      setStats({
        totalMembers: members.length,
        presentToday: presentCount,
        firstTimers: firstTimersCount,
        absent: absentCount,
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingStats(false)
    }
  }

  async function markPresent(memberId) {
    if (!apiUrl || !session) return alert('No session')
    const member = allMembers.find((m) => m._id === memberId)
    if (!member) return alert('Member not found')
    setLoadingPresent(memberId)
    try {
      await axios.post(`${apiUrl}/api/attendance`, {
        sessionId: session._id || session.id,
        email: member.email,
      })
      setSearchQuery('')
      await refreshStats()
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err.message ||
        'Failed'
      alert(msg)
    } finally {
      setLoadingPresent(null)
    }
  }

  async function registerAndMarkFromModal(newMemberData) {
    if (!apiUrl || !session) return alert('No session')
    try {
      const response = await axios.post(`${apiUrl}/api/members`, {
        sessionId: session._id || session.id,
        ...newMemberData,
      })
      setSearchQuery('')
      setShowRegisterModal(false)
      setSuccessMessage({
        name: newMemberData.name,
        message:
          response.data.message ||
          'Member registered and marked present successfully!',
      })
      refreshStats()
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err.message ||
        'Failed'
      alert(msg)
    }
  }

  // Get members with present status for roll call
  const membersForRollCall = allMembers.map((m) => ({
    ...m,
    isPresent: memberStatus[m._id] === 'Present',
  }))

  const attendanceUrl = session
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/attend/${
        session._id || session.id
      }`
    : ''

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-stone-50 dark:bg-[#0a0a0a] text-stone-800 dark:text-gray-200 font-sans selection:bg-blue-500/30 transition-colors duration-300">
      {/* Background Depth Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Light theme background */}
        <div className="absolute inset-0 bg-gradient-to-br from-stone-50 via-blue-50/30 to-purple-50/20 dark:from-[#0a0a0a] dark:via-[#111111] dark:to-[#050505]" />

        {/* Mesh gradients */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-400/5 dark:bg-blue-900/10 rounded-full blur-[140px] opacity-60 dark:opacity-30 mix-blend-normal dark:mix-blend-screen" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-400/5 dark:bg-indigo-900/10 rounded-full blur-[120px] opacity-50 dark:opacity-20 mix-blend-normal dark:mix-blend-screen" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-400/3 dark:bg-blue-900/5 rounded-full blur-[160px] opacity-40" />

        {/* Subtle texture overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.015] dark:opacity-[0.03]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header with Theme Toggle */}
        <header className="mb-12 flex flex-col items-center text-center relative">
          {/* Theme Toggle Button */}
          <motion.button
            initial={{
              opacity: 0,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              duration: 0.4,
            }}
            onClick={toggleTheme}
            className="absolute right-0 top-0 flex items-center gap-2 rounded-2xl border border-stone-200 dark:border-white/10 bg-white/80 dark:bg-white/5 px-4 py-2.5 backdrop-blur-xl transition-all hover:bg-white dark:hover:bg-white/10 hover:shadow-lg hover:shadow-blue-500/5 dark:hover:shadow-blue-900/20 active:scale-95"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <>
                <Moon className="h-4 w-4 text-stone-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-stone-700 dark:text-gray-300">
                  Dark
                </span>
              </>
            ) : (
              <>
                <Sun className="h-4 w-4 text-stone-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-stone-700 dark:text-gray-300">
                  Light
                </span>
              </>
            )}
          </motion.button>

          <motion.div
            initial={{
              opacity: 0,
              y: -20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.6,
            }}
            className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-2xl shadow-blue-500/20 dark:shadow-blue-900/20"
          >
            <LayoutDashboard className="h-8 w-8 text-white" />
          </motion.div>
          <motion.h1
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.6,
              delay: 0.1,
            }}
            className="text-3xl font-bold tracking-tight text-stone-900 dark:text-white sm:text-4xl"
          >
            Fellowship Attendance
          </motion.h1>
          <motion.p
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              duration: 0.6,
              delay: 0.2,
            }}
            className="mt-2 text-stone-600 dark:text-gray-400"
          >
            Real-time monitoring and session management
          </motion.p>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column - Stats & Roll Call */}
          <div className="space-y-6 lg:col-span-7">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <StatsCard
                label="Total Members"
                value={stats.totalMembers}
                icon={Users}
                delay={0.1}
              />
              <StatsCard
                label="Present Today"
                value={stats.presentToday}
                icon={UserCheck}
                delay={0.2}
              />
              <StatsCard
                label="First Timers"
                value={stats.firstTimers}
                icon={UserPlus}
                delay={0.3}
              />
              <StatsCard
                label="Absent"
                value={stats.absent}
                icon={UserX}
                delay={0.4}
              />
            </div>

            {/* Roll Call Section */}
            <div className="h-[500px]">
              <MemberRollCall
                members={membersForRollCall}
                isLoading={loadingStats}
              />
            </div>
          </div>

          {/* Right Column - Actions & QR */}
          <div className="space-y-6 lg:col-span-5">
            <QRSection session={session} attendanceUrl={attendanceUrl} />
            <AttendanceActions
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filteredMembers={filteredMembers}
              memberStatus={memberStatus}
              onMarkPresent={markPresent}
              onRegister={() => {}}
              isLoadingPresent={loadingPresent}
              showRegisterModal={showRegisterModal}
              onShowRegisterModal={() => setShowRegisterModal(true)}
            />
            <SessionManagement
              currentSession={session}
              onNewSession={() => {
                // Add session creation logic later
              }}
              onRefresh={refreshStats}
              isLoadingStats={loadingStats}
            />
          </div>
        </div>
      </div>

      <MemberModal
        open={false}
        onClose={() => {}}
        apiUrl={apiUrl}
        sessionId={session && (session._id || session.id)}
        onMarked={() => refreshStats()}
      />

      {/* Register New Member Modal */}
      {showRegisterModal && (
        <RegisterMemberModal
          open={showRegisterModal}
          onClose={() => setShowRegisterModal(false)}
          onRegister={registerAndMarkFromModal}
        />
      )}

      {/* Success Message Modal */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed inset-0 flex items-center justify-center z-50"
        >
          <div className="fixed inset-0 bg-black/50" />
          <div className="relative bg-white dark:bg-white/10 rounded-2xl p-8 w-full max-w-md text-center border border-stone-200 dark:border-white/10 backdrop-blur-xl">
            <div className="mb-4">
              <svg
                className="w-16 h-16 mx-auto text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
              Success!
            </h3>
            <p className="text-stone-700 dark:text-gray-200 mb-1">
              <strong>{successMessage.name}</strong>
            </p>
            <p className="text-stone-600 dark:text-gray-400 text-sm mb-4">
              {successMessage.message}
            </p>
            <p className="text-xs text-stone-500 dark:text-gray-500">
              This will close automatically...
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
