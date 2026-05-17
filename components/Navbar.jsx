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
    initialLoading,
    refreshing,
    logout,
  } = useApp()

  const [openMenu, setOpenMenu] = useState(false)
  const menuRef = useRef(null)
  const [openUserMenu, setOpenUserMenu] = useState(false)
  const userMenuRef = useRef(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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

  if (initialLoading) {
    return (
      <div className="h-16 border-b bg-white flex items-center px-4">
        <div className="w-40 h-5 bg-gray-200 rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div
      className={`fixed top-0 left-0 w-full z-50 transition ${scrolled ? 'shadow-md bg-white' : 'bg-white/80 backdrop-blur'
        }`}
    >
      <div className="flex items-center justify-between p-4">
        {/* LEFT: Resort Title + Edit */}
        <div className="relative" ref={menuRef}>
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => router.push('/dashboard')}
          >
            <h1 className="font-bold text-xl capitalize">
              {selectedResort?.name || 'Booking'}
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

          {refreshing && (
            <p className="text-xs text-gray-400">Syncing...</p>
          )}

          {/* Booking link */}
          {selectedResort?.slug && !refreshing && (
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
                  className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${selectedResort?.id === resort.id
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
                className="block w-full text-left px-4 py-2 text-blue-500 hover:bg-gray-100"
              >
                + Add Resort
              </button>
            </div>
          )}
        </div>

        {/* RIGHT: User Menu */}
        <div className="flex items-center gap-3">
          {!initialLoading ? (
            <>
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setOpenUserMenu((prev) => !prev)}
                    className="flex items-center gap-2 rounded-full px-3 py-2 hover:bg-gray-50"
                  >
                    <span className="hidden md:block text-sm font-medium">
                      {user.email}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-[#29b55a] text-white flex items-center justify-center font-bold">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
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
                        onClick={logout}
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
                    className="bg-[#29b55a] text-white px-4 py-2 rounded"
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
    </div>
  )
}