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
  const [signupSuccess, setSignupSuccess] = useState(false)

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
    setSignupSuccess(true)
    // router.push('/onboarding')
  }

  if (signupSuccess) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="bg-white w-full max-w-md rounded-2xl shadow p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4 text-3xl">
          ✓
        </div>

        <h1 className="text-2xl font-bold mb-2">
          Check Your Email
        </h1>

        <p className="text-gray-600 mb-4">
          We sent a confirmation link to:
        </p>

        <p className="font-semibold mb-6">
          {email}
        </p>

        <div className="bg-gray-50 rounded-xl p-4 text-left text-sm text-gray-600 mb-6">
          <p className="font-semibold mb-2">
            Next steps:
          </p>

          <ol className="list-decimal pl-5 space-y-1">
            <li>Open your email inbox.</li>
            <li>Click the confirmation link.</li>
            <li>After confirming, you’ll be redirected to setup your resort.</li>
          </ol>
        </div>

        <button
          onClick={() => router.push('/login')}
          className="w-full bg-green-600 text-white p-3 rounded"
        >
          Go to Login
        </button>
      </div>
    </div>
  )
}

  return (
     <div className="flex items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-white">
       <div className='bg-white w-full max-w-md rounded-2xl shadow p-6'>
      <h1 className="text-xl font-bold mb-4 text-blue-500">Create an Account</h1>

      <form onSubmit={handleSignup} className="space-y-3">
        <input
          type="email"
          placeholder="Enter you email address"
          className="w-full border-1 border-gray-700 p-2 rounded-xl"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

       <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Create Password"
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