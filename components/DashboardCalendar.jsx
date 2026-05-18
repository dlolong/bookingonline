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

export default function DashboardCalendar({ onAddBooking }) {
  const {
    confirmedBookings,
    bookingsLoading,
    initialLoading,
    refreshing,
    refreshBookings,
  } = useApp()

  const [view, setView] = useState('calendar')
  const [cancelBooking, setCancelBooking] = useState(null)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelling, setCancelling] = useState(false)

  if (initialLoading) {
    return <Loader text="Loading calendar..." />
  }

  const handleCancelBooking = async () => {
    if (!cancelBooking) return

    if (!cancelReason.trim()) {
      alert('Please enter cancellation reason.')
      return
    }

    setCancelling(true)

    const { error } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        cancellation_reason: cancelReason,
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', cancelBooking.id)

    setCancelling(false)

    if (error) {
      console.error(error)
      alert('Failed to cancel booking.')
      return
    }

    setCancelBooking(null)
    setCancelReason('')
    setOpenModal(false)
    await refreshBookings()
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
            className={`cursor-pointer flex items-center justify-center px-3 py-2 ${view === 'calendar'
              ? 'bg-[#29b55a] text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
          >
            <CalendarDays size={18} />
          </button>

          <button
            onClick={() => setView('list')}
            title="List view"
            className={`cursor-pointer  flex items-center justify-center px-3 py-2 ${view === 'list'
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
          onAddBooking={onAddBooking}
          onCancelBooking={setCancelBooking}
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
                className="border-1 border-[#b7ddbb] bg-[#f5fff6] rounded-xl p-4"
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
                  <div className="content-end justify-self-end">
                    <button
                      onClick={() => setCancelBooking(booking)}
                      className="cursor-pointer border-1 border-red-200 text-red-300 px-2 py-1 rounded mt-1"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}


      {cancelBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-bold mb-2">
              Cancel Booking
            </h3>

            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for cancelling{' '}
              <strong>{cancelBooking.name}</strong>'s booking.
            </p>

            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation"
              className="w-full border rounded p-3 min-h-[100px]"
            />

            <div className="flex gap-2 justify-end mt-4">
              <button
                onClick={() => {
                  setCancelBooking(null)
                  setCancelReason('')
                }}
                disabled={cancelling}
                className="cursor-pointer  px-4 py-2 rounded border"
              >
                Close
              </button>

              <button
                onClick={handleCancelBooking}
                disabled={cancelReason === "" || cancelling}
                className="cursor-pointer  px-4 py-2 rounded bg-red-600 text-white disabled:bg-gray-400"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}