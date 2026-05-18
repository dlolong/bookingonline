'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { usePathname, useRouter } from 'next/navigation'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const router = useRouter()
  const pathname = usePathname()

  const [user, setUser] = useState(null)
  const [resorts, setResorts] = useState([])
  const [getResortsProgress, setGetResortsProgress] = useState(false)
  const [selectedResort, setSelectedResortState] = useState(null)

  const [initialLoading, setInitialLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const [confirmedBookings, setConfirmedBookings] = useState([])
  const [pendingBookings, setPendingBookings] = useState([])
  const [bookingsLoading, setBookingsLoading] = useState(false)

  const [toast, setToast] = useState(null)

  const publicRoutes = [
    '/',
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
  ]
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  )

  const showToast = ({ type = 'success', message }) => {
    setToast({ type, message })

    setTimeout(() => {
      setToast(null)
    }, 3000)
  }

  const hideToast = () => setToast(null)

  const logout = async () => {
    await supabase.auth.signOut()

    setUser(null)
    setResorts([])
    setSelectedResortState(null)
    setConfirmedBookings([])
    setPendingBookings([])
    localStorage.removeItem('selected_resort_id')

    router.push('/login')
  }

  const setSelectedResort = async (resort) => {
    setSelectedResortState(resort)

    if (resort?.id) {
      localStorage.setItem('selected_resort_id', resort.id)
      await refreshBookings(resort.id)
    } else {
      localStorage.removeItem('selected_resort_id')
      setConfirmedBookings([])
      setPendingBookings([])
    }
  }

  const refreshBookings = async (resortId = selectedResort?.id) => {
    if (!resortId) {
      setConfirmedBookings([])
      setPendingBookings([])
      return
    }

    setBookingsLoading(true)

    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('resort_id', resortId)
      .in('status', ['confirmed', 'pending'])
      .order('start_datetime', { ascending: true })

    if (error) {
      console.error(error)
      setBookingsLoading(false)
      return
    }

    const bookings = data || []

    setConfirmedBookings(
      bookings.filter((b) => b.status === 'confirmed')
    )

    setPendingBookings(
      bookings.filter((b) => b.status === 'pending')
    )
    setBookingsLoading(false)
  }

  const loadAppData = async (currentUser, silent = false) => {
    if (!silent) setInitialLoading(true)
    if (silent) setRefreshing(true)

    setUser(currentUser)

    if (!currentUser) {
      setResorts([])
      setSelectedResortState(null)
      localStorage.removeItem('selected_resort_id')
      setInitialLoading(false)
      setRefreshing(false)
      return
    }

    if (isPublicRoute) {
      router.push('/dashboard')
    }

    setGetResortsProgress(true)
    const { data: resortsData, error } = await supabase
      .from('resorts')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at')

    setGetResortsProgress(false)
    if (!error) {

      if (resortsData.length < 1) {
        router.replace('/onboarding')
      }

      const resortsList = resortsData || []
      const storedId = localStorage.getItem('selected_resort_id')

      setResorts(resortsList)

      const selected =
        resortsList.find((r) => r.id === storedId) ||
        resortsList[0] ||
        null

      setSelectedResortState(selected)

      if (selected?.id) {
        await refreshBookings(selected.id)
      }
    }

    setInitialLoading(false)
    setRefreshing(false)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      loadAppData(data.session?.user || null)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        loadAppData(null, true)
        setUser(null)
        setResorts([])
        setSelectedResortState(null)

        if (!isPublicRoute) {
          router.replace('/')
        }
        return
      }

      // silent refresh = no full-page loader
      loadAppData(session.user, true)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AppContext.Provider
      value={{
        user,
        getResortsProgress,
        resorts,
        selectedResort,
        setSelectedResort,

        confirmedBookings,
        pendingBookings,
        bookingsLoading,
        refreshBookings,

        initialLoading,
        refreshing,
        refreshAppData: () => loadAppData(user, true),
        logout,

        toast,
        showToast,
        hideToast,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}