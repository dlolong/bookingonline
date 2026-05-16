'use client'

import { useState } from 'react'
import { signUp } from '@/lib/auth'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSignup = async (e) => {
    e.preventDefault()

    const { error } = await signUp(email, password)

    if (error) {
      alert(error.message)
    } else {
      alert('Account created! You can now login.')
      // router.push('/login')
      router.push('/onboarding')
    }
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Create Account</h1>

      <form onSubmit={handleSignup} className="space-y-3">
        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full bg-green-600 text-white p-2 rounded">
          Sign Up
        </button>
      </form>
    </div>
  )
}