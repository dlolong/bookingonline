'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useApp } from '@/context/AppContext'

export default function ForgotPasswordPage() {
  const { showToast } = useApp()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleReset = async (e) => {
    e.preventDefault()
    setLoading(true)

   const url = process.env.NODE_ENV === "development" ?  'http://localhost:4000' : 'https://resortbooking-y2hv.onrender.com'

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${url}/reset-password`,
    })

    setLoading(false)

    if (error) {
      showToast({
        type: 'error',
        message: error.message,
      })
      return
    }

    showToast({
      type: 'success',
      message: 'Password reset link sent. Please check your email.',
    })
  }

  return (
    <div className="flex items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-white">
      <form
        onSubmit={handleReset}
        className="bg-white w-full max-w-md rounded-2xl shadow p-6 space-y-4"
      >
        <h1 className="text-2xl font-bold">Forgot Password</h1>

        <p className="text-gray-500 text-sm">
          Enter your email and we’ll send you a password reset link.
        </p>

        <input
          type="email"
          placeholder="Email address"
          className="w-full border p-3 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button
          disabled={loading}
          className="w-full bg-[#29b55a] text-white p-3 rounded disabled:bg-gray-400 cursor-pointer"
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
    </div>
  )
}