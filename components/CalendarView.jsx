'use client'

import { useMemo, useState } from 'react'
import { DayPicker, DayProps, useDayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css'
import { format, isSameDay } from 'date-fns'
import './custom-calendar.css'; // See CSS below

function formatDateTime(date, time) {
  const dt = new Date(`${date}T${time}`)
  return format(dt, 'MM-dd-yy HH:mm')
}

export default function CalendarView({ bookings = [] }) {
  const [selectedDate, setSelectedDate] = useState(new Date())

  // Confirmed bookings
  const confirmedDays = useMemo(() => {
    return bookings
      .filter((b) => b.status === 'confirmed')
      .map((b) => ({
        from: new Date(b.start_datetime),
        to: new Date(b.end_datetime),
      }))
  }, [bookings])

  // Pending bookings
  const pendingDays = useMemo(() => {
    return bookings
      .filter((b) => b.status === 'pending')
      .map((b) => ({
        from: new Date(b.start_datetime),
        to: new Date(b.end_datetime),
      }))
  }, [bookings])

  // Bookings for selected date
  const selectedBookings = bookings.filter((b) => {
    const start = new Date(b.start_datetime)
    const end = new Date(b.end_datetime)

    return isSameDay(selectedDate, start) || isSameDay(selectedDate, end) 
    // return selectedDate >= start && selectedDate <= end
  })

  return (
    <div className="grid lg:grid-cols-[60%_1fr] gap-6">
      {/* Calendar */}
      <div style={{ width: "100%" }} className="bg-white rounded-2xl shadow-md p-4">
        <div className="mb-4">
          <h2 className="text-xl font-bold">
            Booking Calendar
          </h2>

          <p className="text-gray-500 text-sm">
            Track resort reservations easily
          </p>
        </div>

      <div style={{ width: "100%" }}>
        <DayPicker
          disabled={{ before: new Date() }}
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          // components={SplitDay}
          modifiers={{
            confirmed: confirmedDays,
            pending: pendingDays,
          }}
          modifiersStyles={{
            confirmed: {
              backgroundColor: '#22c55e',
              color: 'white',
              borderRadius: '60px',
              textAlign: "-webkit-center"
            },
            pending: {
              backgroundColor: '#facc15',
              color: 'black',
              borderRadius: '60px',
            },
          }}
          classNames={{
            day: "h-8 w-8 text-lg", // Large cells
            day_selected: "h-24 w-24 bg-blue-600 text-white",
            caption: "text-2xl font-bold p-4", // Large title
            table: "w-full",
            month: "p-4"
          }}
        />
        </div>

        {/* Legend */}
        <div className="flex gap-4 mt-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500" />
            Confirmed
          </div>

          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-400" />
            Pending
          </div>
        </div>
      </div>

      {/* Booking Details */}
      <div className="bg-white rounded-2xl shadow-md p-4">
        <h2 className="text-xl font-bold mb-2">
          {selectedDate && format(selectedDate, 'MMMM d, yyyy')}
        </h2>

        {selectedBookings.length === 0 ? (
          <div className="text-gray-500 mt-6">
            No bookings for this date
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {selectedBookings.map((booking) => (
              <div
                key={booking.id}
                className="border rounded-xl p-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">
                    {booking.name}
                  </h3>

                  <span
                    className={`px-3 py-1 rounded-full text-sm text-white ${
                      booking.status === 'confirmed'
                        ? 'bg-green-500'
                        : 'bg-yellow-400 text-black'
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>

                <div className="mt-3 space-y-1 text-sm text-gray-600">
                  <p>
                    📅 {`${format(new Date(booking.start_datetime), 'MMMM d, yyyy hh:mm a')} → ${format(new Date(booking.end_datetime), 'MMMM d, yyyy hh:mm a')}`}
                  </p>

                  <p>
                    👥 Guests: {booking.guests}
                  </p>

                  <p>
                    📞 {booking.contact}
                  </p>

                  {booking.notes && (
                    <p>
                      📝 {booking.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}