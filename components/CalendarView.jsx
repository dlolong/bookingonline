'use client'

import { useMemo, useState } from 'react'
import { DayPicker, defaultLocale } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { format, isSameDay } from 'date-fns'
import { Flag, MapPin, NotepadText, Phone, User, Users } from 'lucide-react'

import { supabase } from '@/lib/supabaseClient'
import { useApp } from '@/context/AppContext'

const bookingColors = [
  '#a5ceb3', // pastel green
  '#f3ca4e', // pastel orange
  '#a9c2e0', // pastel blue
  '#e4a1e7', // pastel purple
  '#86c8ba', // pastel red
  '#a5d472', // pastel teal
  '#74dce0', // pastel yellow
  '#abd189', // pastel green
  '#dcd464', // pastel orange
  '#b99bd5', // pastel blue
  '#ea83d9', // pastel purple
  '#e7b950', // pastel red
  '#4caf9b', // pastel teal
  '#c0ca3c', // pastel yellow
]

function getBookingColor(booking, bookings) {
  const index = bookings.findIndex((b) => b.id === booking.id)
  return bookingColors[index % bookingColors.length]
}


function formatDateTime(datetime) {
  if (!datetime) return ''
  return format(new Date(datetime), 'MMMM dd yy hh:mm a')
}

function getBookingsForDay(day, bookings) {
  return bookings.filter((booking) => {
    const start = new Date(booking.start_datetime)
    const end = new Date(booking.end_datetime)

    const dayStart = new Date(day)
    dayStart.setHours(0, 0, 0, 0)

    const dayEnd = new Date(day)
    dayEnd.setHours(23, 59, 59, 999)

    return start <= dayEnd && end >= dayStart
  })
}

function getSlotForDay(day, booking) {
  const start = new Date(booking.start_datetime)
  const end = new Date(booking.end_datetime)

  const isStartDay = isSameDay(day, start)
  const isEndDay = isSameDay(day, end)

  const startHour = start.getHours()
  const endHour = end.getHours()

  // Overnight booking:
  // May 17 7PM → May 18 6AM
  if (isStartDay && startHour >= 6) return 'pm'
  if (isEndDay && endHour <= 18) return 'am'

  // Same-day booking
  if (isStartDay && isEndDay) {
    if (startHour < 18 && endHour <= 6) return 'am'
    if (startHour >= 6 && endHour > 18) return 'pm'
  }

  return 'full'
}

export default function CalendarView({ bookings = [] }) {
  const { refreshBookings } = useApp()
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedBookings, setSelectedBookings] = useState([])
  const [openModal, setOpenModal] = useState(false)

  const [cancelBooking, setCancelBooking] = useState(null)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelling, setCancelling] = useState(false)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const handleDayClick = (day) => {
    setSelectedDate(day)

    const bookingsForDay = bookings.filter((booking) => {
      const start = new Date(booking.start_datetime)
      const end = new Date(booking.end_datetime)

      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)

      return day >= start && day <= end
    })

    if (bookingsForDay.length > 0) {
      setSelectedBookings(bookingsForDay)
      setOpenModal(true)
    }
  }

  const closeModal = () => {
    setOpenModal(false)
    setSelectedBookings([])
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
    <div className='[text-align:-webkit-center]'>
      <DayPicker
        weekStartsOn={1}
        mode="single"
        selected={selectedDate}
        onDayClick={handleDayClick}
        disabled={{ before: today }}
        components={{
          DayButton: (props) => {
            const day = props.day.date
            const isToday = new Date().toDateString() === day.toDateString()

            const dayBookings = getBookingsForDay(day, bookings)

            const amBooking = dayBookings.find((b) => getSlotForDay(day, b) === 'am')
            const pmBooking = dayBookings.find((b) => getSlotForDay(day, b) === 'pm')
            const fullBooking = dayBookings.find((b) => getSlotForDay(day, b) === 'full')

            return (
              <button
                {...props}
                type="button"
                className={
                  `relative w-10 h-10 md:w-14 md:h-14 rounded-full overflow-hidden flex items-center justify-center transition
        ${isToday ? 'ring-2 ring-blue-500 font-bold' : 'border-gray-200'}
        hover:scale-105`}
              >
                {/* Full day */}
                {fullBooking && (
                  <span
                    className="absolute inset-0 shadow-inner"
                    style={{
                      backgroundColor: getBookingColor(fullBooking, bookings),
                    }}
                  />
                )}

                {/* AM */}
                {amBooking && (
                  <span
                    className="absolute top-0 left-0 w-full h-1/2"
                    style={{
                      backgroundColor: getBookingColor(amBooking, bookings),
                    }}
                  />
                )}

                {/* PM */}
                {pmBooking && (
                  <span
                    className="absolute bottom-0 left-0 w-full h-1/2"
                    style={{
                      backgroundColor: getBookingColor(pmBooking, bookings),
                    }}
                  />
                )}

                {/* Today highlight overlay (subtle) */}
                {isToday && (
                  <span className="absolute inset-0 bg-white/40 rounded-full" />
                )}

                {/* Day number */}
                <span className="relative z-10 text-sm font-semibold text-gray-800">
                  {format(day, 'd')}
                </span>
              </button>
            )
          },
        }}
      />
      {/* <DayPicker
        weekStartsOn={1}
        mode="single"
        selected={selectedDate}
        onDayClick={handleDayClick}
        disabled={{ before: today }}
        // modifiers={{
        //   confirmed: confirmedDays,
        //   pending: pendingDays,
        // }}
        // modifiersStyles={{
        //   confirmed: {
        //     backgroundColor: '#22c55e',
        //     color: 'white',
        //     borderRadius: '999px',
        //   },
        //   pending: {
        //     backgroundColor: '#facc15',
        //     color: 'black',
        //     borderRadius: '999px',
        //   },
        // }}
        // className="w-full"
        // classNames={{
        //   table: 'w-full',
        //   head_row: 'grid grid-cols-7',
        //   row: 'grid grid-cols-7',
        //   cell: 'flex justify-center',
        //   day_selected: `
        //     bg-[#29b55a] text-white
        //     scale-105
        //     ring-2 ring-green-300
        //     font-semibold
        //   `,
        //   day_today: 'border border-gray-400',
        //   day_outside: 'text-gray-300',
        //   day_disabled: 'text-gray-300 opacity-50',
        // }}
      /> */}

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
                className="px-4 py-2 rounded border"
              >
                Close
              </button>

              <button
                onClick={handleCancelBooking}
                disabled={cancelReason === "" || cancelling}
                className="px-4 py-2 rounded bg-red-600 text-white disabled:bg-gray-400"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {openModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-bold">
                Bookings for{' '}
                {selectedDate
                  ? format(selectedDate, 'MM-dd-yy')
                  : ''}
              </h3>

              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-black text-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              {selectedBookings.map((booking) => (
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

                  <div className=''>

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

                  <div>
                    <button
                      onClick={() => {
                        setCancelBooking(booking)
                        setCancelReason('')
                      }}
                      className="mt-4 p-2 bg-red-400 text-white py-2 rounded"
                    >
                      Cancel Booking
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}