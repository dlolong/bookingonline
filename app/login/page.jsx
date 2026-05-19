'use client'

import { useState } from 'react'
import { signIn } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const { showToast } = useApp()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await signIn(email, password)

    setLoading(false)
    if (error) {
      showToast({
        type: "error",
        message: error.message
      })
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="flex items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-white">
      <div className='bg-white w-full max-w-md rounded-2xl shadow p-6'>
      <h1 className="text-xl font-bold mb-4">Login</h1>

      <form onSubmit={handleLogin}  className="space-y-3">
        <input
          type="email"
          placeholder="Email"
          className="w-full border-1 border-gray-700 p-2 rounded-xl"
           value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            className="w-full border-1 border-gray-700 p-2 pr-10 rounded-xl"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          disabled={loading || !password || !email}
          className={'cursor-pointer w-full bg-blue-600 text-white p-2 rounded-xl disabled:bg-gray-400'}
        >
          {loading ? 'Processing...' : 'Login'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/forgot-password')}
          className="w-full text-right text-sm text-green-600 cursor-pointer"
        >
          Forgot password?
        </button>
      </form>
      </div>
    </div>
  )
}