'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useApp } from '@/context/AppContext'
import Loader from '@/components/Loader'

export default function Navbar() {
  const router = useRouter()

  const {
    user,
    resorts,
    selectedResort,
    setSelectedResort,
    loading,
  } = useApp()

  const [openMenu, setOpenMenu] = useState(false)
  const menuRef = useRef(null)
  const [openUserMenu, setOpenUserMenu] = useState(false)
  const userMenuRef = useRef(null)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  // 🔥 Close menu when clicking outside
useEffect(() => {
  const handleClickOutside = (e) => {
    if (menuRef.current && !menuRef.current.contains(e.target)) {
      setOpenMenu(false)
    }

    if (
      userMenuRef.current &&
      !userMenuRef.current.contains(e.target)
    ) {
      setOpenUserMenu(false)
    }
  }

  document.addEventListener('mousedown', handleClickOutside)

  return () => {
    document.removeEventListener('mousedown', handleClickOutside)
  }
}, [])

  return (
    <div className="flex items-center justify-between p-4 border-b bg-white">
      {/* LEFT: Resort Title + Edit */}
      <div className="relative" ref={menuRef}>
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => router.push('/dashboard')}
        >
          <h1 className="font-bold text-xl">
            {selectedResort?.name || 'Resort SaaS'}
          </h1>

          {/* ✏️ Edit Icon */}
          {user && resorts.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setOpenMenu((prev) => !prev)
              }}
              className="text-gray-500 hover:text-black text-sm"
            >
              ✏️
            </button>
          )}
        </div>

        {/* Booking link */}
        {selectedResort?.slug && (
          <p className="text-xs text-gray-500">
            /public-booking/{selectedResort.slug}
          </p>
        )}

        {/* 🔥 Popup Menu */}
        {openMenu && (
          <div className="absolute mt-2 w-56 bg-white border rounded-xl shadow-lg z-50 overflow-hidden">
            {resorts.map((resort) => (
              <button
                key={resort.id}
                onClick={() => {
                  setSelectedResort(resort)
                  setOpenMenu(false)
                }}
                className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${
                  selectedResort?.id === resort.id
                    ? 'bg-gray-100 font-semibold'
                    : ''
                }`}
              >
                {resort.name}
              </button>
            ))}

            <div className="border-t mt-1" />

            <button
              onClick={() => {
                setOpenMenu(false)
                router.push('/onboarding')
              }}
              className="block w-full text-left px-4 py-2 text-green-600 hover:bg-gray-100"
            >
              + Add Resort
            </button>
          </div>
        )}
      </div>

    {/* RIGHT: User Menu */}
<div className="flex items-center gap-3">
  {!loading ? (
    <>
      {user ? (
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setOpenUserMenu((prev) => !prev)}
            className="flex items-center gap-2 border rounded-full px-3 py-2 hover:bg-gray-50"
          >
            <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
              {user.email?.charAt(0).toUpperCase()}
            </div>

            <span className="hidden md:block text-sm font-medium">
              {user.email}
            </span>
          </button>

          {openUserMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white border rounded-xl shadow-lg z-50 overflow-hidden">
              <div className="px-4 py-3 border-b">
                <p className="font-semibold">
                  {user.user_metadata?.name || 'Account'}
                </p>

                <p className="text-sm text-gray-500 truncate">
                  {user.email}
                </p>
              </div>

              <button
                onClick={() => {
                  setOpenUserMenu(false)
                  router.push('/settings')
                }}
                className="block w-full text-left px-4 py-3 hover:bg-gray-100"
              >
                Settings
              </button>

              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-3 text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 rounded border"
          >
            Login
          </button>

          <button
            onClick={() => router.push('/signup')}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Try Free
          </button>
        </>
      )}
    </>
  ) : (
    <Loader />
  )}
</div>
    </div>
  )
}