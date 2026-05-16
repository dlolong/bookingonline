'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [resorts, setResorts] = useState([])
  const [selectedResort, setSelectedResortState] = useState(null)
  const [loading, setLoading] = useState(true)

  // 🔥 Save selected resort to localStorage
  const setSelectedResort = (resort) => {
    setSelectedResortState(resort)

    if (resort?.id) {
      localStorage.setItem('selected_resort_id', resort.id)
    } else {
      localStorage.removeItem('selected_resort_id')
    }
  }

  // 🔥 Load everything
  const loadAppData = async (currentUser) => {
    setLoading(true)

    if (!currentUser) {
      setUser(null)
      setResorts([])
      setSelectedResort(null)
      setLoading(false)
      return
    }

    setUser(currentUser)

    const { data: resortsData, error } = await supabase
      .from('resorts')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at')

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    const resortsList = resortsData || []
    setResorts(resortsList)

    // 🔥 Restore selected resort from localStorage
    // const storedId = localStorage.getItem('selected_resort_id')
    const storedId =
      typeof window !== 'undefined'
        ? localStorage.getItem('selected_resort_id')
        : null

    let selected =
      resortsList.find((r) => r.id === storedId) ||
      resortsList[0] ||
      null

    setSelectedResort(selected)

    setLoading(false)
  }

  useEffect(() => {
    // Initial load
    supabase.auth.getUser().then(({ data }) => {
      loadAppData(data.user)
    })

    // Auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user || null
        await loadAppData(currentUser)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <AppContext.Provider
      value={{
        user,
        resorts,
        selectedResort,
        setSelectedResort,
        loading,
        refreshAppData: () => loadAppData(user),
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}