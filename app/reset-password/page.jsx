'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useApp } from '@/context/AppContext'
import { Eye, EyeOff } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const { showToast } = useApp()

  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.updateUser({
      password,
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
      message: 'Password updated successfully.',
    })

    router.replace('/login')
  }

  return (
    <div className="flex items-center justify-center p-6">
      <form
        onSubmit={handleUpdatePassword}
        className="bg-white w-full max-w-md rounded-2xl shadow p-6 space-y-4"
      >
        <h1 className="text-2xl font-bold">Reset Password</h1>

        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="New password"
            className="w-full border p-3 pr-10 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <button
          disabled={loading}
          className="w-full bg-[#29b55a] text-white p-3 rounded disabled:bg-gray-700"
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  )
}