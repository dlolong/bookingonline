'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useApp } from '@/context/AppContext'
import Loader from '@/components/Loader'
import { ChevronDown, Pencil } from 'lucide-react'
import Image from 'next/image'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()

  const {
    user,
    resorts,
    selectedResort,
    setSelectedResort,
    initialLoading,
    refreshing,
    logout,
    profile,
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

  const handleLogout = () => {
    setOpenUserMenu(false)
    logout()
  }

  const handlePublicLinkClick = (link) => {
    window.open(`${window.location.origin}${link}`)
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
            className='pl-4 pr-4 rounded-full'>
            <div
              onClick={() => router.replace(user ? '/dashboard' : '/')}
              className="flex items-center gap-2 content-center"
            >
              {pathname.includes("/dashboard")
                && selectedResort ? <h1 className="font-bold text-xl capitalize cursor-pointer">
                {selectedResort?.name}
              </h1> : (
                <Image
                  src="/logo.png"
                  alt="Resort Logo"
                  width={100}
                  height={0}
                  className="rounded-lg cursor-pointer"
                  priority
                />
              )}

              {/* ✏️ Edit Icon */}
              {user && profile?.plan === "pro" && pathname.includes("/dashboard") && resorts.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setOpenMenu((prev) => !prev)
                  }}
                  className="[text-align:-webkit-center] w-6 text-gray-700 hover:bg-gray-300 hover:text-black text-sm rounded-full cursor-pointer"
                >
                  <ChevronDown width={16} />
                </button>
              )}
            </div>

            {/* Booking link */}
            {pathname.includes('/dashboard') && selectedResort?.slug && (
              <p onClick={() => handlePublicLinkClick(`/public-booking/${selectedResort.slug}`)} className="text-xs text-blue-500">
                {`/public-booking/${selectedResort.slug}`}
              </p>
            )}
          </div>

          {/* 🔥 Popup Menu */}
          {openMenu && (
            <div className="absolute mt-2 w-[max-content] bg-white border border-1 border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden p-5">
              {resorts.map((resort) => (
                <button
                  key={resort.id}
                  onClick={() => {
                    setSelectedResort(resort)
                    setOpenMenu(false)
                  }}
                  className={`capitalize cursor-pointer block w-full text-left px-4 py-2 hover:bg-gray-200 ${selectedResort?.id === resort.id
                    ? 'bg-green-100 font-semibold text-sm'
                    : 'text-xs'
                    }`}
                >
                  {resort.name}
                </button>
              ))}

              <div className="mt-4" />

              <button
                onClick={() => {
                  setOpenMenu(false)
                  router.push('/onboarding')
                }}
                className="block w-full text-left px-4 py-2 text-blue-500 hover:bg-gray-100 cursor-pointer"
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
                    className="flex items-center gap-2 rounded-full px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    <span className="hidden md:block text-sm font-medium">
                      {user.email}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-[#29b55a] text-white flex items-center justify-center font-bold">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                  </button>

                  {openUserMenu && (
                    <div className="absolute right-0 mt-2 w-72 bg-white border-1 border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                      <div className="px-4 py-3 border-b border-b-gray-200">
                        <p className="font-semibold">
                          {user.user_metadata?.name || 'Account'}
                        </p>

                        <p className="text-sm text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>

                      {profile?.role === "admin" && <button
                        onClick={() => {
                          setOpenUserMenu(false)
                          router.push('/admin')
                        }}
                        className="block w-full text-left px-4 py-3 hover:bg-gray-100 cursor-pointer"
                      >
                        Admin
                      </button>}

                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 cursor-pointer"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                !pathname.includes("public-booking") && <>
                  {
                    (pathname === "/" || pathname.includes("signup") || pathname.includes("contact")) &&
                    <button
                      onClick={() => router.push('/login')}
                      className="px-4 py-2 cursor-pointer rounded-xl font-semibold border hover:border-2 hover:border-green-700"
                    >
                      Login
                    </button>}

                  {pathname.includes("login") &&
                    <button
                      onClick={() => router.push('/contact')}
                      className="
                      cursor-pointer bg-[#29b55a] text-white px-4 py-2 rounded-xl font-semibold hover:bg-green-700
                      "
                    >
                      Request Access
                    </button>
                  }

                 {/* {
                  !pathname.includes("partner") &&
                     <button
                    onClick={() => router.push('/partner')}
                    className="px-4 py-2 rounded border text-xs"
                  >
                    Become an Agent
                  </button>} */}
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