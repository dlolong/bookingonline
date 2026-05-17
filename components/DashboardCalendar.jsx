'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useApp } from '@/context/AppContext'
import CalendarView from '@/components/CalendarView'
import Loader from '@/components/Loader'
import { format } from 'date-fns'
import { CalendarDays, Flag, List, MapPin, NotepadText, Phone, User, Users } from 'lucide-react'

function formatDateTime(datetime) {
  return format(new Date(datetime), 'MM-dd-yy HH:mm')
}

export default function DashboardCalendar() {
  const {
    confirmedBookings,
    bookingsLoading,
    initialLoading,
    refreshing,
    refreshBookings,
  } = useApp()

  const [view, setView] = useState('calendar')

  if (initialLoading) {
    return <Loader text="Loading calendar..." />
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold sr-only md:not-sr-only">Reserved</h2>
          {(refreshing || bookingsLoading) && (
            <span className="text-xs text-gray-400">
              Syncing...
            </span>
          )}
        </div>
        <div className="flex rounded-lg border border-[#b3b3b3] overflow-hidden">
          <button
            onClick={() => setView('calendar')}
            title="Calendar view"
            className={`flex items-center justify-center px-3 py-2 ${view === 'calendar'
              ? 'bg-[#29b55a] text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
          >
            <CalendarDays size={18} />
          </button>

          <button
            onClick={() => setView('list')}
            title="List view"
            className={`flex items-center justify-center px-3 py-2 ${view === 'list'
              ? 'bg-[#29b55a] text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
          >
            <List size={18} />
          </button>
        </div>

      </div>

      {view === 'calendar' ? (
        <CalendarView
          bookings={confirmedBookings}
          onBookingCancelled={refreshBookings}
        />
      ) : (
        <div className="space-y-3">

          {confirmedBookings.length === 0 ? (
            <p className="text-sm text-gray-500">
              No confirmed bookings yet.
            </p>
          ) : (
            confirmedBookings.filter((b) => b.status === "confirmed").map((booking) => (
              <div
                key={booking.id}
                className="border-1 border-[#b7ddbb] rounded-xl p-4"
              >
                <div className="items-center justify-between">
                  <h6 className='flex items-center'>
                    <MapPin width={16} className='text-gray-400 mr-2' /> {`${format(new Date(booking.start_datetime), 'EEE, MMMM d, yyyy hh:mm a')}`}
                  </h6>
                  <h6 className='flex items-center'>
                    <Flag width={16} className='text-gray-400 mr-2' /> {`${format(new Date(booking.end_datetime), 'EEE, MMMM d, yyyy hh:mm a')}`}
                  </h6>
                </div>

                <div className='grid grid-cols-2'>

                  <div className="mt-3 space-y-0 text-sm text-black-600">
                    <p className='flex items-center'>
                      <User width={16} className='text-gray-400 mr-2' /> {booking.name}
                    </p>
                    <p className='flex items-center'>
                      <Users width={16} className='text-gray-400 mr-2' /> {booking.guests} pax
                    </p>

                    <p className='flex items-center'>
                      <Phone width={16} className='text-gray-400 mr-2' /> {booking.contact}
                    </p>

                    {booking.notes && (
                      <p className='flex items-center'>
                        <NotepadText width={16} className='text-gray-400 mr-2' /> {booking.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}