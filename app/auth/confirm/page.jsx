'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useApp } from '@/context/AppContext'

export default function ConfirmEmailPage() {
  const router = useRouter()
  const { showToast, refreshAppData } = useApp()

  const [status, setStatus] = useState('verifying')

  useEffect(() => {
    const confirmEmail = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (error || !data.session) {
        setStatus('error')
        showToast?.({
          type: 'error',
          message: 'Invalid or expired confirmation link.',
        })
        return
      }

      const user = data.session.user

      const { data: resorts, error: resortError } = await supabase
        .from('resorts')
        .select('id')
        .eq('user_id', user.id)

      if (resortError) {
        console.error(resortError)
        setStatus('error')
        return
      }

      await refreshAppData?.()

      setStatus('success')

      showToast?.({
        type: 'success',
        message: 'Email confirmed successfully!',
      })

      setTimeout(() => {
        if (!resorts || resorts.length === 0) {
          router.replace('/onboarding')
        } else {
          router.replace('/dashboard')
        }
      }, 1200)
    }

    confirmEmail()
  }, [router, showToast, refreshAppData])

  return (
    <div className="flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow text-center max-w-sm">
        {status === 'verifying' && (
          <>
            <div className="animate-spin w-8 h-8 border-4 border-gray-300 border-t-green-600 rounded-full mx-auto mb-4" />
            <h2 className="text-lg font-semibold">
              Verifying your email...
            </h2>
          </>
        )}

        {status === 'success' && (
          <>
            <h2 className="text-xl font-bold text-green-600 mb-2">
              Email Confirmed 🎉
            </h2>
            <p className="text-gray-600">
              Redirecting...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <h2 className="text-xl font-bold text-red-600 mb-2">
              Verification Failed
            </h2>
            <p className="text-gray-600 mb-4">
              The link may be expired or invalid.
            </p>

            <button
              onClick={() => router.push('/login')}
              className="bg-gray-900 text-white px-4 py-2 rounded"
            >
              Go to Login
            </button>
          </>
        )}
      </div>
    </div>
  )
}