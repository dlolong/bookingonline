'use client'

import { useState } from 'react'
import { signUp } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useApp } from '@/context/AppContext'
import { Eye, EyeOff } from 'lucide-react'

export default function SignupPage() {
  const { showToast } = useApp()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)

    const url = process.env.NODE_ENV === "development" ?  'http://localhost:4000' : 'https://resortbooking-y2hv.onrender.com'

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${url}/auth/confirm`,
      },
    })

    setLoading(false)

    if (error) {
      showToast({
        type: "error",
        message: error.message
      })
      return
    }

    if (data?.user && data.user.identities?.length === 0) {
      showToast({
        type: "error",
        message: 'This email is already registered. Please login instead.'
      })
      return
    }


    showToast({
      type: "success",
      message: 'Signup successful. Please check your email to confirm.'
    })
    router.push('/onboarding')
  }

  return (
     <div className="flex items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-white">
       <div className='bg-white w-full max-w-md rounded-2xl shadow p-6'>
      <h1 className="text-xl font-bold mb-4">Create Account</h1>

      <form onSubmit={handleSignup} className="space-y-3">
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
          disabled={loading || !email || !password}
          className={'cursor-pointer w-full bg-[#29b55a] text-white p-2 rounded disabled:bg-gray-400 rounded-xl'}
        >
          {loading ? 'Processing...' : 'Sign Up'}
        </button>
      </form>
      </div>
    </div>
  )
}