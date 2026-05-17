'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'

export default function ProtectedLayout({ children }) {
  const { user, initialLoading } = useApp()
  const router = useRouter()

  useEffect(() => {
    if (!initialLoading && !user) {
      router.replace('/login')
    }
  }, [user, initialLoading])

  if (initialLoading) return null

  return children
}